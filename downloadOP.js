import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static'
import youtubedl from 'youtube-dl-exec'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { request, gql } from 'graphql-request'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

let db

ffmpeg.setFfmpegPath(pathToFfmpeg);

async function getAnimeList() {
    let arrayAnimeResult = []
    for (let i = 1; i <= 10; i++) {
        let result = await request('https://shikimori.one/api/graphql', createRequest(i))
        arrayAnimeResult = [...arrayAnimeResult, ...result['animes']]
    }
    return arrayAnimeResult
}

function createRequest(page) {
    return gql`
    query Animes {
        animes(limit: 50, page: ${page}, kind: "tv", season: "2020_2024", score: 7) {
            name
            english
            id
            japanese
            russian
            videos {
                id
                imageUrl
                kind
                name
                playerUrl
                url
            }
            airedOn {
                year
            }
            poster {
                originalUrl
            }
        }
    }    
`
}

async function filterAnimeOP(animes) {
    let arrayAnime = []
    for (let anime of animes) {
        if (anime['videos'].length <= 0) continue
        let animeNew = anime
        let openings = []
        for (let op of anime['videos']) {
            if (op['kind'] == "op" && op['url'].includes('youtu.be')) {
                openings.push(op)
            }
        }
        if (openings.length <= 0) continue
        animeNew['videos'] = openings
        arrayAnime.push(animeNew)
    }
    return arrayAnime
}

async function downloadAndAddAnimeOpening(animes) {

    for (let anime of animes) {

        for (let op of anime['videos']) {
            const id = op['id']
            const english = anime['name'] ? anime['name'].replace("\'", "\"") : anime['english'].replace("\'", "\"")
            const russian = anime['russian'].replace("\'", "\"")
            const videoName = `${anime['russian']} ${op['name']}`.replace("\'", "\"")
            const videoURL = op['url']
            const posterURL = anime['poster']['originalUrl'].replace("\'", "\"")
            const year = anime['airedOn']['year']

            await insertAnime(id, english, russian, videoName, videoURL, posterURL, year)

            // await new Promise(resolve => {
            //     const optionsYoutubedl = {
            //         format: 'best', 
            //         output: mp4Name,
            //     };
            //     youtubedl(op['playerUrl'], {
            //         ...optionsYoutubedl
            //     }).then(() => resolve())
            // });

            // await downloadImage(anime['poster']['originalUrl'],screenshotName)

            // await new Promise(resolve => {
            //     try {
            //         fs.readFile(path.join(__dirname, 'assets/anime.json'), (err, obj) => {
            //             let jsonDBAnime = JSON.parse(obj)
            //             jsonDBAnime[op['id']] = {
            //                 "id" : `${op['id']}`,
            //                 "name_ru" : `${anime['russian']} ${op['name']}`,
            //                 "nameVideo" : `${anime['russian']}`,
            //                 "name_en" : `${anime['english']}`,
            //                 "year" : 2022,
            //                 "genres" : ``,
            //                 "season" : ``
            //             }
            //             fs.writeFile(path.join(__dirname, 'assets/anime.json'),JSON.stringify(jsonDBAnime),(err)=>{
            //                 if (err) {
            //                     console.log(err);
            //                     return
            //                 }
            //                 console.log("Файл записан");
            //             })
            //             resolve()
            //         })
            //     } catch (err) {
            //         console.error(err);
            //     }
            // });
        }
    }

}

async function downloadImage(url, filePath) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });

    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve();
        });

        response.data.on('error', err => {
            reject(err);
        });
    });
}

async function start() {
    await openDB()
    let anime = await getAnimeList()
    anime = await filterAnimeOP(anime)
    await downloadAndAddAnimeOpening(anime)
    let result = await db.all("SELECT * FROM anime")
    console.log(result)
}

async function openDB() {
    db = await open({
        filename: 'anime.db',
        driver: sqlite3.Database
    })
}

async function insertAnime(id, nameEN, nameRU, nameVideo, videoURL, pictureURL, year) {
    // console.log(`INSERT INTO anime ("id","name_en", "name_ru", "name_video", "video_url", "picture_url", "year") VALUES (${id},'${nameEN}','${nameRU}','${nameVideo}','${videoURL}','${pictureURL}',${year})`)
    await db.exec(`INSERT INTO anime ("id","name_en", "name_ru", "name_video", "video_url", "picture_url", "year") VALUES (${id},'${nameEN}','${nameRU}','${nameVideo}','${videoURL}','${pictureURL}',${year})`)
}

start()