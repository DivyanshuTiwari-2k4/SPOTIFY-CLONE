
let currentSong = new Audio;
let songs;
let currFolder;


// handling TIME FORMAT
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}


// fetching songs from folder
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/SPOTIFY/${currFolder}/`)//song link       <//>
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/SPOTIFY/${currFolder}/`)[1])//song link        <//>
        }
    }
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Divyanshu</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
            </li>`;
    }


    // passing song from songList to playMusic for playing the music
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}


//function to play song
const playMusic = (track, pause = false) => {
    currentSong.src = `/SPOTIFY/${currFolder}/` + track;//song link                     <//>
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}


async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/SPOTIFY/songs/`)//song link       <//>
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")


    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        
        if (e.href.includes("/SPOTIFY/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/SPOTIFY/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div  class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/SPOTIFY/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            </div>`

        }
        //Load the playlist folder whever the card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0]);
            })
        })
    }
}

async function main() {
    //Sending specific folder to playMusic
    await getSongs("songs/1NCS")//song link                                     <//>
    playMusic(songs[0], true)

    //Display all the albums
    displayAlbums()

    //handling  PLAY and PAUSE of music 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })


    // handling dynamic TIME UPDATION
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime")
            .innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    // handling seekbar CIRCLE with time updation and VISA-VERSA
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = +"%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })


    // Add and eventListener on HAMBURGER
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })


    // Add an eventListener on CLOSE icon
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })


    //Add eventListener on PREVIOUS and NEXT button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
   


    //add eventListener on VOLUME and MUTE
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if(currentSong.volume>0){
            document.querySelector(".volume>img").src= document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })
    document.querySelector(".volume>img").addEventListener("click",e=>{
        
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })
}
main()
