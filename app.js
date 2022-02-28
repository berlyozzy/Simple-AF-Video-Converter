const fs = require('fs');
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');

let status = {
    frame: '',
    fps: '',
    q: '',
    size: '',
    time: '',
    bitrate: '',
    dup: '',
    drop: '',
    speed: ''
};

const ffmpeg = createFFmpeg({ 
    log: false,
    logger : ({message}) => {

        try{
            let matches = message.match(/(\S*)=\s*(\d*[.0-9:]*(kB|kbits\/s|x)?)/gm);
            let output = {}

            if (matches != null && matches.length != 0) {

                matches.forEach(e => {
                    e = e.split("="); 
                    e = {
                        [e[0].trim()] : e[1].trim()
                    }
                    
                    output = {...output, ...e}
                })

                status = output;
                console.log(status)
            }
        }catch(error){
            console.log(error)
        }
        

    }
});

const Render = async () => {

  await ffmpeg.load();
  ffmpeg.FS('writeFile', 'file.webm', await fetchFile('./file.webm'));
  await ffmpeg.run('-i', 'file.webm', 'file.mp4');
  await fs.promises.writeFile('./file.mp4', ffmpeg.FS('readFile', 'file.mp4'));
  process.exit(0);
  
};

Render()
