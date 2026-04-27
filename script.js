/* === FOOTER YEAR === */
document.getElementById("footerYear").textContent = new Date().getFullYear();

/* === CURSOR === */
var cursor=document.getElementById("cursor"),cursorDot=document.getElementById("cursor-dot");
var trailCont=document.getElementById("cursor-trail-container");
var trailPool=[],MAX_TRAIL=12,trailIdx=0;
for(var t=0;t<MAX_TRAIL;t++){
    var td=document.createElement("div");
    td.className="trail-dot";td.style.opacity="0";
    trailCont.appendChild(td);trailPool.push(td);
}
var lastTrail=0;
document.addEventListener("mousemove",function(e){
    cursor.style.left=e.clientX+"px";cursor.style.top=e.clientY+"px";
    cursorDot.style.left=e.clientX+"px";cursorDot.style.top=e.clientY+"px";
    var now=Date.now();
    if(now-lastTrail>40){
        lastTrail=now;
        var dot=trailPool[trailIdx%MAX_TRAIL];trailIdx++;
        dot.style.left=e.clientX+"px";dot.style.top=e.clientY+"px";
        dot.style.animation="none";void dot.offsetWidth;
        dot.style.animation="trailFade .5s ease forwards";
    }
},{passive:true});
document.addEventListener("mousedown",function(){cursor.classList.add("clicking");});
document.addEventListener("mouseup",function(){cursor.classList.remove("clicking");});

/* === PARTICLES === */
var pCanvas=document.getElementById("particles-canvas"),pCtx=pCanvas.getContext("2d");
var PW,PH,particles=[];
var particleVisible=true;
var heroObs=new IntersectionObserver(function(e){particleVisible=e[0].isIntersecting;},{threshold:0});
heroObs.observe(document.getElementById("home"));
function resizeP(){PW=pCanvas.width=window.innerWidth;var sec=pCanvas.closest("section");PH=pCanvas.height=(sec&&sec.offsetHeight>0?sec.offsetHeight:window.innerHeight);}
function Particle(){this.reset();}
Particle.prototype.reset=function(){
    this.x=Math.random()*PW;this.y=Math.random()*PH;
    this.vx=(Math.random()-.5)*.3;this.vy=-Math.random()*.4-.1;
    this.r=Math.random()*1.2+.3;this.a=Math.random()*.5+.1;
    this.life=0;this.maxLife=Math.random()*180+80;
    this.color=Math.random()>.7?"#e03030":"#4da6ff";
};
Particle.prototype.update=function(){this.x+=this.vx;this.y+=this.vy;this.life++;if(this.life>this.maxLife||this.y<-10)this.reset();};
Particle.prototype.draw=function(){pCtx.globalAlpha=Math.sin(Math.PI*this.life/this.maxLife)*this.a;pCtx.fillStyle=this.color;pCtx.beginPath();pCtx.arc(this.x,this.y,this.r,0,Math.PI*2);pCtx.fill();};
var PCOUNT=50,CDIST=80,CDIST2=80*80,pFrame=0;
function initP(){particles=[];for(var i=0;i<PCOUNT;i++)particles.push(new Particle());}
function animP(){
    requestAnimationFrame(animP);
    if(!particleVisible)return;
    pFrame++;pCtx.clearRect(0,0,PW,PH);
    if(pFrame%2===0){
        pCtx.lineWidth=.5;pCtx.strokeStyle="#e03030";
        for(var i=0;i<PCOUNT;i++){
            for(var j=i+1;j<PCOUNT;j++){
                var dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d2=dx*dx+dy*dy;
                if(d2<CDIST2){pCtx.globalAlpha=(1-Math.sqrt(d2)/CDIST)*.07;pCtx.beginPath();pCtx.moveTo(particles[i].x,particles[i].y);pCtx.lineTo(particles[j].x,particles[j].y);pCtx.stroke();}
            }
        }
    }
    pCtx.globalAlpha=1;
    for(var k=0;k<PCOUNT;k++){particles[k].update();particles[k].draw();}
    pCtx.globalAlpha=1;
}
resizeP();initP();animP();
var resizeTimer;
window.addEventListener("resize",function(){clearTimeout(resizeTimer);resizeTimer=setTimeout(resizeP,150);});

/* === REVEAL === */
var revObs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting)e.target.classList.add("visible");});
},{threshold:.08});
document.querySelectorAll(".reveal").forEach(function(el){revObs.observe(el);});

/* === SCROLL-SPY NAV === */
var navLinks=document.querySelectorAll(".nav-links a[data-section]");
var spySections=["about","portfolio","skills","contact"].map(function(id){return document.getElementById(id);}).filter(Boolean);
var spyObs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
        if(e.isIntersecting){
            var id=e.target.id;
            navLinks.forEach(function(a){a.classList.toggle("active",a.dataset.section===id);});
        }
    });
},{threshold:0.35});
spySections.forEach(function(s){spyObs.observe(s);});

/* === NAV (with focus trap) === */
var ham=document.getElementById("ham"),mob=document.getElementById("mobNav");
var mobLinks=mob.querySelectorAll("a");
var firstMobLink=mobLinks[0],lastMobLink=mobLinks[mobLinks.length-1];

function openMob(){
    ham.classList.add("open");mob.classList.add("open");
    mob.setAttribute("aria-hidden","false");ham.setAttribute("aria-expanded","true");
    firstMobLink.focus();
}
function closeMob(){
    ham.classList.remove("open");mob.classList.remove("open");
    mob.setAttribute("aria-hidden","true");ham.setAttribute("aria-expanded","false");
}
ham.addEventListener("click",function(){mob.classList.contains("open")?closeMob():openMob();});
mob.addEventListener("keydown",function(e){
    if(e.key==="Tab"){
        if(e.shiftKey){if(document.activeElement===firstMobLink){e.preventDefault();lastMobLink.focus();}}
        else{if(document.activeElement===lastMobLink){e.preventDefault();firstMobLink.focus();}}
    }
    if(e.key==="Escape")closeMob();
});
document.querySelectorAll(".ml").forEach(function(l){l.addEventListener("click",closeMob);});
document.addEventListener("click",function(e){if(mob.classList.contains("open")&&!mob.contains(e.target)&&e.target!==ham&&!ham.contains(e.target))closeMob();});

/* === SCROLL UP === */
var su=document.getElementById("scrollUp");
window.addEventListener("scroll",function(){su.classList.toggle("show",scrollY>400);},{passive:true});
su.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});

/* === CONTACT FORM (AJAX with feedback) === */
var form=document.getElementById("contactForm");
var formBtn=document.getElementById("formBtn");
var formMsg=document.getElementById("formMsg");
if(form){
    form.addEventListener("submit",function(e){
        e.preventDefault();
        formBtn.disabled=true;
        formBtn.textContent="Sending...";
        formMsg.className="form-msg";
        formMsg.textContent="";
        fetch(form.action,{method:"POST",body:new FormData(form),headers:{Accept:"application/json"}})
        .then(function(r){
            if(r.ok){
                formMsg.className="form-msg success";
                formMsg.textContent="// Message sent! I'll get back to you soon.";
                form.reset();
            } else {
                formMsg.className="form-msg error";
                formMsg.textContent="// Something went wrong. Try emailing me directly.";
            }
        }).catch(function(){
            formMsg.className="form-msg error";
            formMsg.textContent="// Network error. Try emailing me directly.";
        }).finally(function(){
            formBtn.disabled=false;
            formBtn.textContent="Send Message";
        });
    });
}

/* === PROJECT FILTER === */
(function(){
    var btns=document.querySelectorAll("#filterBar .filter-btn");
    var cards=document.querySelectorAll("#projGrid .proj-card");
    btns.forEach(function(btn){
        btn.addEventListener("click",function(){
            var filter=btn.dataset.filter;
            btns.forEach(function(b){b.classList.remove("active");b.setAttribute("aria-pressed","false");});
            btn.classList.add("active");btn.setAttribute("aria-pressed","true");
            cards.forEach(function(card){
                var match=filter==="all"||card.dataset.engine===filter;
                card.classList.toggle("hidden",!match);
            });
        });
    });
})();

/* === ASTEROID BLASTER MINI GAME === */
(function(){
    var gc=document.getElementById("gameCanvas");
    if(!gc)return;
    var gx=gc.getContext("2d");
    var W=gc.width,H=gc.height;
    var scoreEl=document.getElementById("gScore");
    var hiEl=document.getElementById("gHi");
    var livesEl=document.getElementById("gLives");
    var overlay=document.getElementById("gOverlay");
    var state="idle";
    var ship,keys,spawnTimer,spawnRate,waveNum,raf;
    var bullets=[],asteroids=[],sparks=[];
    var score=0,lives=3,hiScore=0;
    var scanCanvas=document.createElement("canvas");
    scanCanvas.width=W;scanCanvas.height=H;
    var sCtx=scanCanvas.getContext("2d");
    sCtx.fillStyle="rgba(0,0,0,0.10)";
    for(var sy=0;sy<H;sy+=4)sCtx.fillRect(0,sy,W,1);
    function initGame(){ship={x:W/2,y:H-55,w:16,h:20,vx:0,spd:4.5,shootCD:0,flash:0,dead:false};bullets=[];asteroids=[];sparks=[];score=0;lives=3;spawnTimer=0;spawnRate=75;waveNum=1;keys={left:false,right:false,fire:false};updateHUD();}
    function updateHUD(){scoreEl.textContent=score;hiEl.textContent=hiScore;var h="";for(var i=0;i<lives;i++)h+="&#9829;";livesEl.innerHTML=h||"--";}
    function spawnRock(){var sz=Math.random()*20+12;var pts=[],n=Math.floor(8+Math.random()*5);for(var i=0;i<n;i++)pts.push(0.65+Math.random()*0.38);asteroids.push({x:sz+Math.random()*(W-sz*2),y:-sz,vx:(Math.random()-.5)*2.4,vy:Math.random()*1.6+0.7+waveNum*0.12,sz:sz,rot:0,rotV:(Math.random()-.5)*0.07,n:n,pts:pts});}
    function emit(x,y,col,n){for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,spd=Math.random()*3.5+.5;sparks.push({x:x,y:y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:1,dec:Math.random()*.05+.02,sz:Math.random()*2+.5,col:col});}}
    function d2(a,b){var dx=a.x-b.x,dy=a.y-b.y;return dx*dx+dy*dy;}
    function drawShip(){if(ship.dead)return;if(ship.flash>0&&Math.floor(ship.flash/4)%2===0)return;gx.save();gx.translate(ship.x,ship.y);var col=ship.flash>0?"#fff":"#e03030";gx.strokeStyle=col;gx.lineWidth=1.6;gx.shadowColor=col;gx.shadowBlur=ship.flash>0?18:8;gx.beginPath();gx.moveTo(0,-ship.h/2);gx.lineTo(ship.w/2,ship.h/2);gx.lineTo(0,ship.h/2-5);gx.lineTo(-ship.w/2,ship.h/2);gx.closePath();gx.stroke();if(state==="playing"){gx.strokeStyle="rgba(77,166,255,.8)";gx.shadowColor="#4da6ff";gx.shadowBlur=10;gx.beginPath();gx.moveTo(-4,ship.h/2-4);gx.lineTo(0,ship.h/2+5+Math.random()*7);gx.lineTo(4,ship.h/2-4);gx.stroke();}gx.restore();}
    function drawRock(a){gx.save();gx.translate(a.x,a.y);gx.rotate(a.rot);gx.strokeStyle="#667";gx.lineWidth=1.2;gx.fillStyle="rgba(18,18,28,.85)";gx.shadowColor="rgba(80,80,100,.2)";gx.shadowBlur=4;gx.beginPath();var step=Math.PI*2/a.n;for(var i=0;i<a.n;i++){var r=a.sz*a.pts[i],ang=i*step;if(i===0)gx.moveTo(Math.cos(ang)*r,Math.sin(ang)*r);else gx.lineTo(Math.cos(ang)*r,Math.sin(ang)*r);}gx.closePath();gx.fill();gx.stroke();gx.restore();}
    function loop(){
        raf=requestAnimationFrame(loop);gx.clearRect(0,0,W,H);gx.drawImage(scanCanvas,0,0);
        if(state==="playing"){
            if(keys.left)ship.vx=Math.max(ship.vx-.9,-ship.spd);else if(keys.right)ship.vx=Math.min(ship.vx+.9,ship.spd);else ship.vx*=0.78;
            ship.x=Math.max(ship.w,Math.min(W-ship.w,ship.x+ship.vx));
            if(ship.flash>0)ship.flash--;if(ship.shootCD>0)ship.shootCD--;
            if(keys.fire&&ship.shootCD===0){bullets.push({x:ship.x,y:ship.y-ship.h/2-2,vy:-10});ship.shootCD=11;}
            spawnTimer++;if(spawnTimer>=spawnRate){spawnRock();spawnTimer=0;spawnRate=Math.max(22,spawnRate-0.8);if(score>waveNum*400)waveNum++;}
            for(var bi=bullets.length-1;bi>=0;bi--){var b=bullets[bi];b.y+=b.vy;if(b.y<-10){bullets.splice(bi,1);continue;}var hit=false;for(var ai=asteroids.length-1;ai>=0;ai--){var a=asteroids[ai],thr=a.sz*.75;if(d2(b,a)<thr*thr){emit(a.x,a.y,"#e03030",12);score+=20+waveNum*6;if(score>hiScore)hiScore=score;updateHUD();asteroids.splice(ai,1);hit=true;break;}}if(hit)bullets.splice(bi,1);}
            for(var ri=asteroids.length-1;ri>=0;ri--){var rock=asteroids[ri];rock.x+=rock.vx;rock.y+=rock.vy;rock.rot+=rock.rotV;if(rock.y>H+rock.sz*2){asteroids.splice(ri,1);continue;}var rt=ship.w*.7+rock.sz*.65;if(d2(ship,rock)<rt*rt&&!ship.dead&&ship.flash===0){emit(ship.x,ship.y,"#e03030",18);emit(rock.x,rock.y,"#556",8);asteroids.splice(ri,1);lives--;updateHUD();if(lives<=0){ship.dead=true;state="over";setTimeout(function(){overlay.innerHTML='<h3>GAME OVER</h3><p style="margin-top:.5rem">Score: '+score+'</p><p style="margin-top:.4rem">Press <span class="gkey">SPACE</span> to retry</p>';overlay.style.display="flex";},800);}else ship.flash=40;}}
        }
        if(bullets.length){gx.save();gx.fillStyle="#e03030";gx.shadowColor="#e03030";gx.shadowBlur=8;for(var bdi=0;bdi<bullets.length;bdi++){gx.beginPath();gx.arc(bullets[bdi].x,bullets[bdi].y,2.8,0,Math.PI*2);gx.fill();}gx.restore();}
        asteroids.forEach(drawRock);
        if(sparks.length){gx.save();for(var si=sparks.length-1;si>=0;si--){var sp=sparks[si];sp.x+=sp.vx;sp.y+=sp.vy;sp.vy+=0.06;sp.life-=sp.dec;if(sp.life<=0){sparks.splice(si,1);continue;}gx.globalAlpha=sp.life;gx.fillStyle=sp.col;gx.shadowColor=sp.col;gx.shadowBlur=5;gx.beginPath();gx.arc(sp.x,sp.y,sp.sz,0,Math.PI*2);gx.fill();}gx.restore();}
        drawShip();gx.globalAlpha=1;gx.strokeStyle="rgba(224,48,48,0.12)";gx.lineWidth=1;gx.strokeRect(0,0,W,H);
    }
    function startGame(){overlay.style.display="none";initGame();state="playing";if(!raf)loop();}
    document.addEventListener("visibilitychange",function(){if(document.hidden&&state==="playing"){cancelAnimationFrame(raf);raf=null;}else if(!document.hidden&&state==="playing"&&!raf){loop();}});
    document.addEventListener("keydown",function(e){
        if(e.code==="ArrowLeft"||e.code==="KeyA"){if(keys)keys.left=true;}
        if(e.code==="ArrowRight"||e.code==="KeyD"){if(keys)keys.right=true;}
        if(e.code==="Space"){e.preventDefault();if(state==="idle"||state==="over")startGame();else if(keys)keys.fire=true;}
    });
    document.addEventListener("keyup",function(e){if(!keys)return;if(e.code==="ArrowLeft"||e.code==="KeyA")keys.left=false;if(e.code==="ArrowRight"||e.code==="KeyD")keys.right=false;if(e.code==="Space")keys.fire=false;});
})();