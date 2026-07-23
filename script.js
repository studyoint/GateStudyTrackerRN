fetch("aptitude gc.txt")
.then(r=>r.text())
.then(t=>{

title.innerText=t.match(/COURSE\s*:\s*(.*)/)[1];

let html="";

[...t.matchAll(/Lecture\s+(\d+):\s*([\s\S]*?\.webm)/g)].forEach(x=>{
html+=`<div onclick="play('${x[2].trim()}')">Lecture ${x[1]}</div>`;
});

list.innerHTML=html;

});

function play(url){
player.src=url;
player.play();
}