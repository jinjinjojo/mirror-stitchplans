import*as t from"../vendor/three/build/three.module.min.js";import{stage as Q,GLSL as $}from"./index.js";export const meta={name:"Frost",blurb:"Ice shards under a rippling aurora",element:"ice",colors:"native"};const _=`uniform sampler2D uNoise;
float vnoise(vec3 x){vec3 p=floor(x),f=fract(x);f=f*f*(3.-2.*f);vec2 uv=p.xy+vec2(37.,17.)*p.z+f.xy;vec2 rg=texture2D(uNoise,(uv+.5)/256.).yx;return mix(rg.x,rg.y,f.z);}
float vfbm(vec3 p){float f=0.,a=.5;for(int i=0;i<4;i++){f+=a*vnoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return f/.9375;}`;function T(e){const r=new Uint8Array(65536),h=new Uint8Array(256*256*4);for(let i=0;i<r.length;i++)r[i]=Math.random()*256;for(let i=0;i<256;i++)for(let p=0;p<256;p++){const s=i*256+p;h[s*4]=r[(i+17)%256*256+(p+37)%256],h[s*4+1]=r[s],h[s*4+3]=255}const l=new e.DataTexture(h,256,256);return l.wrapS=l.wrapT=e.RepeatWrapping,l.magFilter=l.minFilter=e.LinearFilter,l.needsUpdate=!0,l}let b=3;const a=(e=0,x=1)=>{b=b+1831565813|0;let r=Math.imul(b^b>>>15,1|b);return r=r+Math.imul(r^r>>>7,61|r)^r,e+((r^r>>>14)>>>0)/4294967296*(x-e)},H=`vec3 env(vec3 d,float t,float light){float h=d.y;
if(light>.5)return h>0.?mix(vec3(.75,.88,.95),vec3(.55,.75,.95),h)+vec3(.1,.35,.25)*exp(-pow((h-.35)*4.,2.))*.5:vec3(.85,.9,.95);
vec3 sky=mix(vec3(.02,.05,.09),vec3(.004,.008,.025),smoothstep(0.,.6,h));
float au=exp(-pow((h-.32)*4.5,2.))*(.55+.45*sin(d.x*5.+d.z*3.+t*.25));
sky+=mix(vec3(.08,.85,.5),vec3(.45,.2,.85),smoothstep(.2,.55,h))*au*.7;
return h>0.?sky:vec3(.22,.3,.4)*(.5+.5*smoothstep(-.6,0.,h));}`;function E(e,x,{light:r=!1,count:h=17,noise:l=T(e)}={}){const i=new e.Group,p=b;b=3;const s=[],C=[],U=[],B=(n,f,g,u,M)=>{const N=(d,c,L)=>Array.from({length:6},(P,G)=>{const D=G/6*Math.PI*2+L;return new e.Vector3(Math.cos(D)*c,d,Math.sin(D)*c)}),y=a(-.1,.1),V=N(0,n*.82,0),o=N(f,n,y),m=new e.Vector3(a(-.12,.12)*n,f+g,a(-.12,.12)*n),v=(...d)=>d.forEach(c=>{const L=c.clone().applyMatrix4(u);s.push(L.x,L.y,L.z),C.push(c.y/(f+g)),U.push(M)});for(let d=0;d<6;d++){const c=(d+1)%6;v(V[d],o[d],V[c]),v(V[c],o[d],o[c]),v(o[d],m,o[c])}},I=new e.Euler,A=new e.Matrix4,S=new e.Quaternion;for(let n=0;n<h;n++){const f=n===0,g=f?.05:a(.25,1.15),u=a(0,Math.PI*2),M=f?1:Math.max(.28,1.05-g*.7)*a(.55,1),N=4.2*M,y=.55*Math.sqrt(M)*a(.85,1.15);I.set(Math.cos(u)*g,a(0,6.28),Math.sin(u)*g,"YXZ"),S.setFromEuler(I),A.compose(new e.Vector3(Math.cos(u)*(f?0:a(.2,.9)),-.25,Math.sin(u)*(f?0:a(.2,.9))),S,new e.Vector3(1,1,1)),B(y,N,y*a(1.1,1.7),A,n)}for(let n=0;n<9;n++){const f=a(0,Math.PI*2),g=a(1.4,3.2),u=a(.15,.32);I.set(a(-.5,.5),a(0,6.28),a(-.5,.5)),S.setFromEuler(I),A.compose(new e.Vector3(Math.cos(f)*g,-.15,Math.sin(f)*g),S,new e.Vector3(1,1,1)),B(.45*Math.sqrt(u),4.2*u,.35,A,h+n)}b=p;const F=new e.BufferGeometry().setAttribute("position",new e.Float32BufferAttribute(s,3)).setAttribute("aH",new e.Float32BufferAttribute(C,1)).setAttribute("aId",new e.Float32BufferAttribute(U,1));F.computeVertexNormals();const w={uTime:{value:0},uLight:{value:r?1:0},uTint:{value:new e.Color(10479871)},uNoise:{value:l}},k=`attribute float aH,aId;varying vec3 vN,vW,vL;varying float vH,vId;
void main(){vL=position;vH=aH;vId=aId;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`,z=new e.Mesh(F,new e.ShaderMaterial({uniforms:w,vertexShader:k,side:e.BackSide,transparent:!0,depthWrite:!1,fragmentShader:`${_}uniform float uTime,uLight;varying vec3 vN,vW,vL;varying float vH,vId;
void main(){float core=exp(-length(vL.xz)*.55)*pow(1.-vH,1.3);float veil=vfbm(vL*1.4+vec3(0.,uTime*.04,vId));
vec3 c=vec3(.01,.05,.12)+vec3(.25,.7,1.)*(core*1.1+veil*.18);float a=.7;
if(uLight>.5){c=vec3(.25,.5,.75)+vec3(.2,.4,.6)*core;a=.55;}
gl_FragColor=vec4(c,a);
#include <colorspace_fragment>
}`})),W=new e.Mesh(F,new e.ShaderMaterial({uniforms:w,vertexShader:k,transparent:!0,fragmentShader:`${$.noise}${_}${H}uniform float uTime,uLight;uniform vec3 uTint;varying vec3 vN,vW,vL;varying float vH,vId;
void main(){vec3 N=normalize(vN);vec3 V=normalize(cameraPosition-vW);float ndv=clamp(dot(N,V),0.,1.);float fr=pow(1.-ndv,3.);
vec3 rfl=reflect(-V,N),rfr=refract(-V,N,.76);
float facet=fract(sin(dot(floor(N*8.),vec3(12.9898,78.233,37.719)))*43758.5453);
vec3 c=env(rfr,uTime,uLight)*uTint*(.55+.7*facet)+env(rfl,uTime,uLight)*fr*1.1;
float core=exp(-length(vL.xz)*.55)*pow(1.-vH,1.3);float veil=vfbm(vL*1.4+vec3(0.,uTime*.04,vId));
float crack=1.-smoothstep(0.,.03,abs(snoise(vL*1.1+vId)));
c+=vec3(.35,.8,1.)*(core*1.3+veil*.22+crack*.35*(1.-vH));
c+=vec3(1.)*pow(max(dot(rfl,normalize(vec3(-.4,.75,.5))),0.),90.)*1.6+vec3(.6,.9,1.)*pow(fr,2.)*.5;
c+=vec3(.7,.95,1.)*smoothstep(.93,1.,vH)*.6;
float a=.42+fr*.5;
if(uLight>.5){c=mix(vec3(.04,.26,.5),vec3(.62,.86,1.),facet*.75+ndv*.25)+vec3(1.)*pow(max(dot(rfl,normalize(vec3(-.4,.75,.5))),0.),60.)*.9+vec3(.3,.6,.8)*core*.4+vec3(.9,.97,1.)*fr*.4;a=.85+fr*.15;}
gl_FragColor=vec4(c,a);
#include <colorspace_fragment>
}`}));return z.renderOrder=6,W.renderOrder=7,i.add(z,W),i.userData.uniforms=w,i.userData.tick=n=>{w.uTime.value=n},i}export const models={crystal:(e,x,{light:r=!1}={})=>E(e,x,{light:r})};export function start(e,x){const r=!!x.light,h=!!x.lite,l=Q(t,e,x,{fov:50,fog:null,lights:!1,bloom:{strength:.8,radius:.45,threshold:.62}}),{rig:i,camera:p}=l,s={uTime:{value:0},uLight:{value:r?1:0},uCam:{value:new t.Vector3},uAccent:{value:new t.Color(x.colors.accent)},uNoise:{value:T(t)}},C=r?t.NormalBlending:t.AdditiveBlending;{const o=new t.Mesh(new t.SphereGeometry(190,48,24),new t.ShaderMaterial({uniforms:s,side:t.BackSide,depthWrite:!1,transparent:r,vertexShader:"varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`${_}uniform float uTime,uLight;varying vec3 vD;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){vec3 d=normalize(vD);float h=d.y;float az=atan(d.x,-d.z);
vec3 c=mix(vec3(.007,.016,.036),vec3(.002,.004,.014),smoothstep(0.,.5,h));
c+=vec3(.004,.028,.022)*exp(-pow((h-.32)*3.,2.))*(.6+.4*sin(az*3.+uTime*.1));
vec3 cell=floor(d*260.);float st=hash(cell);float tw=.5+.5*sin(uTime*(1.+st*3.)+st*40.);
c+=vec3(.75,.85,1.)*step(.9965,st)*tw*smoothstep(.02,.2,h)*1.4;
float r1=1.-abs(vnoise(vec3(cos(az)*3.,sin(az)*3.,1.))*2.-1.),r2=1.-abs(vnoise(vec3(cos(az)*11.,sin(az)*11.,2.))*2.-1.);
float m=.01+.09*pow(r1,4.)+.03*pow(r2,3.);
if(h<m){float k=smoothstep(m-.03,m,h);c=mix(vec3(.003,.007,.015),vec3(.025,.06,.07),k*k*k);}
if(uLight>.5){if(h>=m)discard;c=mix(vec3(.6,.7,.8),vec3(.86,.91,.96),smoothstep(m-.06,m,h));}
gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
}`}));o.renderOrder=-3,i.add(o)}const U=new t.Mesh(new t.CircleGeometry(150,72).rotateX(-Math.PI/2),new t.ShaderMaterial({uniforms:s,transparent:!0,depthWrite:!1,vertexShader:"varying vec3 vW;void main(){vW=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`${_}${H}uniform float uTime,uLight;uniform vec3 uCam,uAccent;varying vec3 vW;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 p=vW.xz;vec3 V=normalize(uCam-vW);float dist=length(uCam-vW);
float drift=vfbm(vec3(p*.06,1.));
vec3 n=normalize(vec3((vnoise(vec3(p*.3,0.))-.5)*.24,1.,(vnoise(vec3(p*.3,5.))-.5)*.24));
float ice=smoothstep(.52,.78,vfbm(vec3(p*.022,7.)))*smoothstep(4.,9.,length(p));
float rip=.5+.5*sin(dot(p,vec2(.9,.4))*3.+vnoise(vec3(p*.4,3.))*6.);
vec3 snow=mix(vec3(.01,.02,.042),vec3(.034,.058,.098),drift)*(.85+.3*rip);
snow+=vec3(.01,.06,.04)*drift;
vec3 R=reflect(-V,n);vec3 sky=env(R,uTime,0.);vec3 mirror=vec3(.003,.008,.018)+max(sky-vec3(.02,.04,.07),0.)*.6;
vec3 c=mix(snow,mirror,ice*.75);
float heart=exp(-length(p)*.3);c+=vec3(.12,.35,.55)*heart*.7;
vec2 cell=floor(p*7.);float gh=hash(cell);vec2 f=fract(p*7.)-.5;
float gl=step(.985,gh)*smoothstep(.12,.0,length(f))*pow(.5+.5*sin(uTime*2.+gh*80.+dot(V.xz,vec2(9.,7.))),12.)*smoothstep(40.,6.,dist);
c+=mix(vec3(.8,.95,1.),uAccent,step(.996,gh))*gl*2.5;
float fog=smoothstep(35.,140.,dist);c=mix(c,vec3(.01,.022,.042),fog);
float a=1.;
if(uLight>.5){c=mix(vec3(.82,.88,.94),vec3(.97,.99,1.),drift)+vec3(.3,.45,.6)*ice*.25-vec3(.1,.06,.0)*heart*.4+vec3(.4,.5,.6)*gl;a=1.-smoothstep(14.,40.,dist);}
gl_FragColor=vec4(c,a);
#include <colorspace_fragment>
}`}));U.renderOrder=-2,i.add(U);const B=h?2:3,I=[],A=[],S=[],F=[],w=220;for(let o=0;o<B;o++)for(let m=0;m<=w;m++)for(const v of[0,1])I.push((m/w-.5)*260,v,0),A.push(m/w,v),S.push(o);for(let o=0;o<B;o++)for(let m=0;m<w;m++){const v=(o*(w+1)+m)*2;F.push(v,v+1,v+2,v+1,v+3,v+2)}const k=new t.Mesh(new t.BufferGeometry().setAttribute("position",new t.Float32BufferAttribute(I,3)).setAttribute("uv",new t.Float32BufferAttribute(A,2)).setAttribute("aId",new t.Float32BufferAttribute(S,1)).setIndex(F),new t.ShaderMaterial({uniforms:s,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:C,vertexShader:`uniform float uTime;attribute float aId;varying vec2 vUv;varying float vId;
void main(){vUv=uv;vId=aId;float x=position.x,t=uTime;
float z=-42.-aId*15.+sin(x*.022+t*.05+aId*2.)*20.+sin(x*.06-t*.09+aId)*7.+sin(x*.14+t*.22)*1.6;
float y=21.+aId*5.+x*.05*(aId-1.)+uv.y*(17.+8.*sin(x*.025+aId*1.7+t*.03))+sin(x*.05+t*.25+aId)*2.5;
gl_Position=projectionMatrix*modelViewMatrix*vec4(x+aId*20.,y,z,1.);}`,fragmentShader:`${_}uniform float uTime,uLight;varying vec2 vUv;varying float vId;
void main(){float t=uTime;float x=vUv.x;
float rays=vfbm(vec3(x*55.+vId*9.,t*.12,vId))*.7+vnoise(vec3(x*160.,t*.3,vId+3.))*.3;rays=smoothstep(.42,.75,rays);
float hem=smoothstep(0.,.06,vUv.y)*exp(-vUv.y*2.4);
float run=.5+.5*sin(x*26.-t*.7+vId*3.)*sin(x*9.+t*.31);
float side=smoothstep(0.,.12,x)*smoothstep(1.,.88,x);
vec3 c=mix(vec3(.12,1.,.55),vec3(.15,.8,.85),smoothstep(.05,.3,vUv.y));c=mix(c,vec3(.55,.25,1.),smoothstep(.3,.85,vUv.y));
float blot=smoothstep(.35,.7,vfbm(vec3(x*4.+vId*3.,t*.04,vId)));
float a=hem*(.3+rays*.9)*(.35+.65*run)*(.25+.75*blot)*side*(1.-vId*.2)*.75;
if(uLight>.5){c=mix(vec3(.05,.62,.42),vec3(.42,.25,.8),smoothstep(.15,.8,vUv.y))*.75;a*=.85;}
gl_FragColor=vec4(c*1.3,clamp(a,0.,1.));
#include <colorspace_fragment>
}`}));k.frustumCulled=!1,k.renderOrder=-1,i.add(k);const z=E(t,x.colors,{light:r,count:h?11:17,noise:s.uNoise.value});z.scale.setScalar(2.1),i.add(z);const W=h?4:7,n=[],f=[],g=[];for(let o=0;o<W;o++){const m=o/W*Math.PI*2+a(-.3,.3),v=a(5,13),d=[Math.cos(m)*v,a(.6,1.4),Math.sin(m)*v];for(const[L,P]of[[-1,-1],[1,-1],[-1,1],[1,1]])n.push(...d),f.push(L,P,o,a(8,13));const c=o*4;g.push(c,c+1,c+2,c+1,c+3,c+2)}const u=new t.Mesh(new t.BufferGeometry().setAttribute("position",new t.Float32BufferAttribute(n,3)).setAttribute("aQ",new t.Float32BufferAttribute(f,4)).setIndex(g),new t.ShaderMaterial({uniforms:s,transparent:!0,depthWrite:!1,vertexShader:`attribute vec4 aQ;varying vec2 vUv;varying float vId;uniform float uTime;
void main(){vUv=aQ.xy;vId=aQ.z;vec4 mv=modelViewMatrix*vec4(position+vec3(sin(uTime*.05+aQ.z)*2.,0.,0.),1.);float sc=length(modelViewMatrix[0].xyz);
mv.xy+=aQ.xy*vec2(aQ.w,aQ.w*.28)*sc;gl_Position=projectionMatrix*mv;}`,fragmentShader:`${_}uniform float uTime,uLight;varying vec2 vUv;varying float vId;
void main(){float d=vfbm(vec3(vUv*vec2(1.6,2.)+vec2(uTime*.03+vId,0.),uTime*.02+vId));
float a=smoothstep(.4,.75,d)*(1.-smoothstep(.3,1.,length(vUv*vec2(1.,1.)))) *.32;
vec3 c=uLight>.5?vec3(1.):vec3(.14,.28,.42);gl_FragColor=vec4(c,a*.7);
#include <colorspace_fragment>
}`}));u.frustumCulled=!1,u.renderOrder=8,i.add(u);const M=h?1800:6e3,N=new Float32Array(M*4);for(let o=0;o<M;o++)N.set([a(-40,46),a(-50,22),a(),a()],o*4);const y=new t.Points(new t.BufferGeometry().setAttribute("position",new t.Float32BufferAttribute(new Float32Array(M*3),3)).setAttribute("seed",new t.Float32BufferAttribute(N,4)),new t.ShaderMaterial({uniforms:{...s,uScale:{value:400}},transparent:!0,depthWrite:!1,blending:C,vertexShader:`uniform float uTime,uScale;attribute vec4 seed;varying float vA;
void main(){float t=uTime,sp=.6+seed.w*.8;float y=mod(26.-seed.z*28.-t*sp*1.3,28.)-2.;
vec3 p=vec3(seed.x+sin(t*.4+seed.z*30.)*1.1+t*.35,y,seed.y+cos(t*.33+seed.z*20.));p.x=mod(p.x+40.,86.)-40.;
vec4 mv=modelViewMatrix*vec4(p,1.);vA=smoothstep(-2.,1.,y)*smoothstep(26.,22.,y);
gl_PointSize=uScale*(.06+.12*seed.w*seed.w)/-mv.z;gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform float uLight;varying float vA;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.1,d)*vA;vec3 c=vec3(.85,.93,1.);
if(uLight>.5){c=vec3(.55,.68,.8);a*=.8;}gl_FragColor=vec4(c,a*.85);
#include <colorspace_fragment>
}`}));y.frustumCulled=!1,y.renderOrder=9,i.add(y);const V=new t.Vector3(-i.position.x*.2,8,0);return p.position.set(0,3.2,25),p.lookAt(V),l.run((o,m)=>{s.uTime.value=o,z.userData.tick(o),i.worldToLocal(s.uCam.value.copy(p.position)),y.material.uniforms.uScale.value=l.renderer.domElement.height*.5,z.rotation.y=Math.sin(o*.05)*.25,p.position.set(l.pointer.x*1.3+Math.sin(o*.06)*.8,3.2+l.pointer.y*.7,25),p.lookAt(V)}),l}
