import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { exec, execSync } from 'child_process'
import { ffmpegTrimOpening, ffmpegCreateMP4OP, ffmpegCreateResultOP } from './ffmpegLib.js'
import youtubedl  from 'youtube-dl-exec'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

let db
async function openDB() {
    db = await open({
        filename: 'anime.db',
        driver: sqlite3.Database
    })
}

await openDB()

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

export async function createTicTokVersion (openingArr) {
    const datanow = new Date()
    const assets = `.\\assets`
    const results = `\\results`
    const nameDir = `${assets}${results}\\${datanow.getFullYear()}-${datanow.getMonth()}-${datanow.getDate()}_${datanow.getHours()}-${datanow.getMinutes()}-${datanow.getSeconds()}`
    const resultName = `${datanow.getFullYear()}-${datanow.getMonth()}-${datanow.getDate()}_${datanow.getHours()}-${datanow.getMinutes()}-${datanow.getSeconds()}`
    execSync(`mkdir ${nameDir}`)
    let arrayOpeningsStr = []
    for(let el of openingArr) {
        const video = await db.get(`SELECT * FROM anime WHERE "id" = ${el.id}`)
        const startOp = `${nameDir}\\${el.id}1.mp4`
        await new Promise(resolve => {
            const optionsYoutubedl = {
                format: 'best', 
                output: `${startOp}`,
            };
            youtubedl(video.video_url, {
                ...optionsYoutubedl
            }).then(() => resolve())
        });
        await downloadImage(video.picture_url,`${nameDir}\\${video.id}.jpeg`)

        const endOPMP3 = `${nameDir}\\${el.id}.mp3`
        const endOPMP4 = `${nameDir}\\${el.id}.mp4`
        const imgOP = `${nameDir}\\${el.id}.jpeg`
        ffmpegTrimOpening(startOp, endOPMP3, el.startTime, 20, nameDir)
        ffmpegCreateMP4OP(imgOP, endOPMP4, endOPMP3, 20, nameDir, el.id, video.name_ru)
        arrayOpeningsStr.push(el.id)
    }
    ffmpegCreateResultOP(arrayOpeningsStr, resultName, nameDir)
    console.log('всё')
    execSync(`rmdir /s/q ${nameDir}`)
}