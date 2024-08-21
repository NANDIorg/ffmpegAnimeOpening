import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { exec, execSync, spawnSync } from 'child_process'
import fs from 'fs'
import wordwrap from 'wordwrap'
const wrap = wordwrap(15, {
    mode: 'soft'
});



function ffmpegTrimOpening(startOp, endOp, startTime, time, dir) {
    let execStr = `ffmpeg -i ${startOp} -ss ${startTime} -t ${time} -filter_complex "atempo=1.2" -vn -acodec libmp3lame ${endOp}` 
    execSync(execStr, { stdio: 'ignore' })
}


function ffmpegCreateMP4OP(IMG, end, opMP3, time, dirResult, id, data) {
    const staticIMG = `.\\assets\\startIMG.jpg`
    let arrayMP4 = []
    let execStr = ``
    execStr = `copy .\\assets\\start.mp4 ${dirResult}\\1.mp4`
    // console.log(execStr)
    // let child = spawnSync("powershell.exe", [execStr])
    execSync(execStr, { stdio: 'ignore' })
    arrayMP4.push(`${dirResult}\\1.mp4`)

    execStr = `ffmpeg -loop 1 -i ${IMG} -c:v libx264 -t 10 -pix_fmt yuv420p -vf "scale=1080:1920,setsar=1,drawtext=text='${wrap(data.replace(":","\\:"))}':fontfile=public/font/anime/AnimeAce.ttf:fontsize=75:fontcolor=white:bordercolor=black:borderw=2:x=(w-text_w)/2:y=(h-text_h)/2" ${dirResult}\\2.mp4`
    console.log(execStr)
    execSync(execStr, { stdio: 'ignore', shell: 'powershell.exe' })

    arrayMP4.push(`${dirResult}\\2.mp4`)
    execStr = `ffmpeg -i ${arrayMP4[0]} -i ${arrayMP4[1]} -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[outv]" -map "[outv]" ${dirResult}\\3.mp4`
    execSync(execStr, { stdio: 'ignore' })
    execStr = `ffmpeg -i ${dirResult}\\3.mp4 -i ${opMP3} -af "afade=t=out:st=15:d=5" -c:v copy -c:a aac -shortest ${end}`
    execSync(execStr, { stdio: 'ignore' })
    execStr = `del ${dirResult}\\3.mp4 ${dirResult}\\2.mp4 ${dirResult}\\1.mp4 ${dirResult}\\${id}.mp3 ${dirResult}\\1i.mp4`
    execSync(execStr, { stdio: 'ignore' })
}

function ffmpegCreateResultOP(animeOpenings, resName, dir) {
    let textAnime = ""
    let execStr = ``
    for(let el of animeOpenings) {
        textAnime += `file '${el}.mp4'\n`
    }
    fs.writeFileSync(`${dir}\\op.txt`, textAnime, (err) => {
        console.log('файл записан')
    })
    execStr = `ffmpeg -f concat -safe 0 -i ${dir}\\op.txt -c copy .\\assets\\results\\${resName}.mp4`
    console.log(execStr)
    execSync(execStr)
}

export { ffmpegTrimOpening, ffmpegCreateMP4OP, ffmpegCreateResultOP }