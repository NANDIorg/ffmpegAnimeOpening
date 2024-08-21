import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static'
import youtubedl  from 'youtube-dl-exec'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { request, gql } from 'graphql-request'

ffmpeg.setFfmpegPath(pathToFfmpeg);

async function getAnimeList() {
    let arrayAnimeResult = []
    for(let i = 1; i <= 5; i++) {
        let result = await request('https://shikimori.one/api/graphql', createRequest(i))
        arrayAnimeResult = [...arrayAnimeResult,...result['animes']]
    }
    return arrayAnimeResult
}

function createRequest(page) {
    return gql`
    query Animes {
        animes(limit: 50, page: ${page}, kind: "tv", season: "2020_2024", score: 7) {
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
        }
    }    
`
}

async function filterAnimeOP(animes) {
    let arrayAnime = []
    for(let anime of animes) {
        if (anime['videos'].length <= 0) continue
        let animeNew = anime
        let openings = []
        for(let op of anime['videos']) {
            let regexp = /youtube.com/i;
            if (op['kind'] == "op" || op['kind'] == "ed") {
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

    for(let anime of animes) {

        for(let op of anime['videos']) {

            await new Promise(resolve => {
                const optionsYoutubedl = {
                    format: 'best', 
                    output: mp4Name,
                };
                youtubedl(op['playerUrl'], {
                    ...optionsYoutubedl
                }).then(() => resolve())
            });

            await downloadImage(anime['poster']['originalUrl'],screenshotName)

            await new Promise(resolve => {
                try {
                    fs.readFile(path.join(__dirname, 'assets/anime.json'), (err, obj) => {
                        let jsonDBAnime = JSON.parse(obj)
                        jsonDBAnime[op['id']] = {
                            "id" : `${op['id']}`,
                            "name_ru" : `${anime['russian']} ${op['name']}`,
                            "nameVideo" : `${anime['russian']}`,
                            "name_en" : `${anime['english']}`,
                            "year" : 2022,
                            "genres" : ``,
                            "season" : ``
                        }
                        fs.writeFile(path.join(__dirname, 'assets/anime.json'),JSON.stringify(jsonDBAnime),(err)=>{
                            if (err) {
                                console.log(err);
                                return
                            }
                            console.log("Файл записан");
                        })
                        resolve()
                    })
                } catch (err) {
                    console.error(err);
                }
            });
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
    let anime = await getAnimeList()
    anime = await filterAnimeOP(anime)
    await downloadAndAddAnimeOpening(anime)
    console.log('Всё')
}

start()