const express = require('express')
const app = express()
const path = require('path')
var fs = require('fs')
const bodyParser = require('body-parser')
const { exec, execSync } = require('child_process')
const multer  = require("multer");
const genresArray = {}
const pathToFfmpeg = require('ffmpeg-static')
console.log(pathToFfmpeg)

fs.readFile(path.join(__dirname, 'assets/genres.json'), (err, obj) => {
    JSON.parse(obj)['genres'].forEach(el => {
        genresArray[el.id] = el
    })
});

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        console.log(file.mimetype)
        if (file.mimetype == "video/mp4") {
            cb(null, "assets/videos/"); 
        } else if (file.mimetype == "image/png") {
            cb(null, "assets/screnshot/");
        } else if (file.mimetype == "image/jpeg") {
            cb(null, "assets/screnshot/");
        }
        
    },
    filename: (req, file, cb) =>{
        let fileName =  "_" + file.originalname
        cb(null, fileName);
    }
});

app.use('/videos', express.static(path.join(__dirname, 'assets/videos')))
app.use('/screnshot', express.static(path.join(__dirname, 'assets/screnshot')))
app.use('/result', express.static(path.join(__dirname, 'assets/result')))
app.use('/js', express.static(path.join(__dirname, 'public/js')))
app.use('/image', express.static(path.join(__dirname, 'public/img')))
app.use('/fonts', express.static(path.join(__dirname, 'public/font')))
app.use('/css', express.static(path.join(__dirname, 'public/css')))
app.use(bodyParser.json());
const uploadImage = multer({storage:storageConfig})

// Шаблон
// app.get('/Юрл', function(req, res) {
//     fs.readFile('public/Название файла', (err, html) => {
//         res.writeHeader(200, { "Content-Type": "text/html" });
//         res.write(html)
//         res.end()
//     })
// })



app.get('/', function(req, res) {
    fs.readFile('public/index.html', (err, html) => {
        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
    });
});

app.get('/pattern_youtube', (req, res) => {
    fs.readFile('public/pages/pattern_youtube.html', (err, html) => {
        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
    });
});

app.get('/pattern_tiktok', (req, res) => {
    fs.readFile('public/pages/pattern_tiktok.html', (err, html) => {
        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
    });
});

app.get('/youtube_redactor', (req, res) => {
    fs.readFile('public/pages/youtube_redactor.html', (err, html) => {
        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
    });
});

app.get('/upload', (req, res) => {
    fs.readFile('public/pages/load_opening.html', (err, html) => {
        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
    });
});

////////////////////////////////////////////
///////////////////   GET   ////////////////
////////////////////////////////////////////

app.get('/getVideo', (req, res) => {
    fs.readFile(path.join(__dirname, 'assets/anime.json'), (err, obj) => {
        let arrAnime = [];
        for (el in JSON.parse(obj)) {
            arrAnime.push(JSON.parse(obj)[el]);
        }
        res.send(arrAnime);
    });
});

app.get('/getGenres', (req, res) => {
    fs.readFile(path.join(__dirname, 'assets/genres.json'), (err, obj) => {
        res.send(JSON.parse(obj)['genres']);
    });
});

app.get('/downloadVideo/:id', (req, res) => {
    console.log(req.params);
    res.download(path.join(__dirname, `assets/videos/${req.params.id}.mp4`));
})

app.get('/getVideo/:id', (req, res)=>{
    fs.readFile(path.join(__dirname, 'assets/anime.json'), (err, obj) => {
        const animeDate = JSON.parse(obj);
        res.send(animeDate[req.params.id]);
    })
})

app.get('/getVideosParametr', (req, res)=>{
    let genresArrayParams = JSON.parse(req.query.genres)
    let i = 0
    let nameGenre = ''
    let nameAnimeParm = req.query.name.toLowerCase()
    let seasonFilter = req.query.seasonFilter
    let yearFilter = req.query.yearFilter
    let resultArray = []
    fs.readFile(path.join(__dirname,'assets/anime.json'), (err, result) => {
        let jsonAnime = JSON.parse(result)
        if (nameAnimeParm.length == 0 && genresArrayParams.length == 0 && seasonFilter == 'Не выбрано' && yearFilter.length == 0) {
            console.log("Всё");
            for (el in jsonAnime) {
                resultArray.push(jsonAnime[el])
            }
            res.send(resultArray)
            res.end()
            return
        }
        for (el in jsonAnime) {
            i = 0
            if (yearFilter.length != 0 && Number(yearFilter) != jsonAnime[el].year) {
                continue
            }
            if (seasonFilter != "Не выбрано" && seasonFilter != jsonAnime[el].season) {
                continue
            }
            if (nameAnimeParm.length != 0 && jsonAnime[el].name_ru.toLowerCase().indexOf(nameAnimeParm) == -1) {
                continue
            }
            for (el2 in genresArrayParams) {
                nameGenre = genresArray[genresArrayParams[el2]].name
                if (JSON.parse(jsonAnime[el].genres).indexOf(nameGenre) != -1) {
                    i++
                }
            }
            if (i < genresArrayParams.length) {
                continue
            }
            resultArray.push(jsonAnime[el])
        }
        res.send(resultArray)
        res.end()
    })
})

/////////////////////////////////////////////
///////////////////   POST   ////////////////
/////////////////////////////////////////////

app.post('/uploadAnime',uploadImage.fields([{ name: 'image', maxCount: 2 },{ name: 'info', maxCount: 1 }]), (req, res) => {
    console.log(JSON.parse(req.body.info))
    const infoAnime = JSON.parse(req.body.info)
    try {
        const nameFileAnime = infoAnime.enName.split(' ').join('')
        execSync(`REN "${path.join(__dirname,'assets/videos/_'+infoAnime.videoName)}" ${nameFileAnime}.mp4`)
        console.log(nameFileAnime);
        execSync(`ffmpeg -i ${path.join(__dirname,'assets/videos/'+nameFileAnime)}.mp4 -b:v 4000k -r 60 -vf drawtext="x=10:y=10:borderw=3:bordercolor=black:fontfile=public/font/Obelix-Pro.ttf:text='${infoAnime.ruName}':fontsize=24:fontcolor=white" ${path.join(__dirname,'assets/videos/'+nameFileAnime)}.ts`)
        console.log("Mp4 в ts с текстом");
        execSync(`REN "${path.join(__dirname,'assets/screnshot/_'+infoAnime.imgName)}" ${nameFileAnime}.png`)
        console.log("Переименован файл png");
        fs.readFile(path.join(__dirname, 'assets/anime.json'), (err, obj) => {
            let jsonDBAnime = JSON.parse(obj)
            let genresAnime = []
            infoAnime.genresAnime.forEach(element => {
                genresAnime.push(genresArray[element].name)
            });
            jsonDBAnime[infoAnime.enName.split(' ').join('')] = {
                "id" : `${infoAnime.enName.split(' ').join('')}`,
                "name_ru" : `${infoAnime.ruName}`,
                "name_en" : `${infoAnime.enName}`,
                "year" : Number(infoAnime.yearAnime),
                "genres" : `${JSON.stringify(genresAnime)}`,
                "season" : `${infoAnime.seasonAnime}`
            }
            fs.writeFile(path.join(__dirname, 'assets/anime.json'),JSON.stringify(jsonDBAnime),(err)=>{
                if (err) {
                    console.log(err);
                    return
                }
                console.log("Файл записан");
            })
            res.send({
                status : 200,
                body : {}
            })
        })
    } catch (err) {
        console.log(err);
        res.send({
            status : 500,
            body : {
                err: err
            }
        })
    }
})

app.post('/createVideo', (req, res) => {
    let arr = req.body
    console.log(arr)
    const datanow = new Date()
    const nameFile = `${datanow.getFullYear()}-${datanow.getMonth()}-${datanow.getDate()}_${datanow.getHours()}-${datanow.getMinutes()}-${datanow.getSeconds()}`
    resultObrezVideos(nameFile,arr)
    // textAnime = `file 'start.ts'\n`
    textAnime = ''
    for (el in arr) {
        textAnime += `file 'results/${nameFile}/${el}_res3.ts'\n`
        textAnime += `file 'results/${nameFile}/${el}_video2.ts'\n`
    }
    // textAnime += `file 'end.ts'`
    fs.writeFileSync(path.join(__dirname, `assets/file.txt`), textAnime, (err) => {
        console.log('файл записан')
    })
    createVideoRes(nameFile, arr)
    createResultatVideo(nameFile)
    res.end()
})

app.get('/*', function(req, res) {
    fs.readFile('public/pages/404.html', (err, html) => {
        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
    });
});

app.listen(3000)

function createResultatVideo (nameFile) {
    console.log(`ffmpeg -f concat -i ${`assets/file.txt`} -c copy ${path.join(__dirname, `assets/results/`)+nameFile}.ts`)
    execSync(`ffmpeg -f concat -i ${`assets/file.txt`} -c copy ${path.join(__dirname, `assets/results/`)+nameFile}.ts`,(error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`,500);
            return;
        }
        if (stderr) {
            console.log(200,`ffmpeg -i ${path.join(__dirname, `assets/results/`)+nameFile}.ts ${path.join(__dirname, `assets/results/`)+nameFile}.mp4`);
            return;
        }
        console.log(`stdout: ok concat`,200);
        
    })
    execSync(`ffmpeg -i ${path.join(__dirname, `assets/results/`)+nameFile}.ts ${path.join(__dirname, `assets/results/`)+nameFile}.mp4`,(error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(200)
            return;
        }
        console.log(`stdout: ts`);
    })
    exec(`rd /q /s ${path.join(__dirname, 'assets/results/'+nameFile)}`)
    exec(`del ${path.join(__dirname, 'assets/results/'+nameFile)}.ts`)
}

function resultObrezVideos (nameDir, obj) {
    execSync(`mkdir ${path.join(__dirname, `assets/results/`)+nameDir}`, (err, stdout, stderr) => {
        if (err) {
            console.log(`error: ${err.message}`);
            return;
        }
        if (stderr) {
            console.log(`err: ${stderr.message}`)
            return;
        }
        console.log(200, 'mkdir')
        console.log(`stdout: ts`)
    })
    for (el in obj) {
        nameOp = el
        execSync(`ffmpeg -ss ${obj[el].startTime} -i ${path.join(__dirname, `assets/videos/`+el)}.ts -b:v 4000k -r 60 -t 10 ${path.join(__dirname,`assets/results/`+nameDir+`/`+el+`_video1`)}.ts`, (err, stdout, stderr) => {
            if (err) {
                console.log(`error: ${err.message}`);
                return;
            }
            if (stderr) {
                console.log(200, 'ffmpegObrez')
                return;
            }
        })
        execSync(`ffmpeg -ss ${obj[el].startTime+10} -i ${path.join(__dirname, `assets/videos/`+el)}.ts -af afade=t=out:st=9:d=1 -t 10 -b:v 4000k -r 60 ${path.join(__dirname,`assets/results/`+nameDir+`/`+el+`_video2`)}.ts`, (err, stdout, stderr) => {
            if (err) {
                console.log(`error: ${err.message}`);
                return;
            }
            if (stderr) {
                console.log(200, 'ffmpegObrez')
                return;
            }
        })
    }
}

function createVideoRes (nameDir, obj) {
    for (el in obj) {
        nameOp = el
        execSync(`ffmpeg -i ${path.join(__dirname,`assets/results/`+nameDir+`/`+el+`_video1`)}.ts -i ${path.join(__dirname, `public/img/imageop.jpg`)} -b:v 4000k -r 60 -filter_complex "[0:v][1:v]overlay" ${path.join(__dirname,`assets/results/`+nameDir+`/`+el+`_res1`)}.ts`, (err, stdout, stderr) => {
            if (err) {
                console.log(`error: ${err.message}`);
                return;
            }
            if (stderr) {
                console.log(200, 'ffmpegObr')
                return;
            }
        })
        execSync(`ffmpeg -i ${path.join(__dirname,`assets/results/`+nameDir+`/`+el+`_res1`)}.ts -i ${path.join(__dirname, `public/img/10sec.ts`)} -b:v 4000k -r 60 -filter_complex "[1:v]colorkey=0x000000:0.3:0.2[timer];[0:v][timer]overlay" ${path.join(__dirname,`assets/results/`+nameDir+`/`+el+`_res2`)}.ts`,(err, stdout, stderr)=>{
            if (err) {
                console.log(`error: ${err.message}`);
                return;
            }
            if (stderr) {
                console.log(200, 'ffmpegObr')
                return;
            }
            console.log(200);
        })
        execSync(`ffmpeg -i ${path.join(__dirname,`assets/results/`+nameDir+`/`+el+`_res2`)}.ts -b:v 4000k -r 60 -t 10 ${path.join(__dirname,`assets/results/`+nameDir+`/`+el+`_res3`)}.ts`)
    }
}