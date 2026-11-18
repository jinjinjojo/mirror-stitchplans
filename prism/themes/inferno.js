import*as t from"../vendor/three/build/three.module.min.js";import{stage as K,rnd as V,GLSL as Y}from"./index.js";export const meta={name:"Inferno",blurb:"A lava caldera with a molten core and rising embers",element:"fire",colors:"native"};const M=`uniform sampler2D uNoise;
float vnoise(vec3 x){vec3 p=floor(x),f=fract(x);f=f*f*(3.-2.*f);vec2 uv=p.xy+vec2(37.,17.)*p.z+f.xy;vec2 rg=texture2D(uNoise,(uv+.5)/256.).yx;return mix(rg.x,rg.y,f.z);}
float vfbm(vec3 p){float f=0.,a=.5;for(int i=0;i<4;i++){f+=a*vnoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return f/.9375;}`;function q(o){const e=new Uint8Array(65536),r=new Uint8Array(256*256*4);for(let i=0;i<e.length;i++)e[i]=Math.random()*256;for(let i=0;i<256;i++)for(let l=0;l<256;l++){const u=i*256+l;r[u*4]=e[(i+17)%256*256+(l+37)%256],r[u*4+1]=e[u],r[u*4+3]=255}const n=new o.DataTexture(r,256,256);return n.wrapS=n.wrapT=o.RepeatWrapping,n.magFilter=n.minFilter=o.LinearFilter,n.needsUpdate=!0,n}const I=`
vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
// x: distance to the nearest cell point, y: distance to the cell edge (F2-F1)
vec2 voro(vec2 x,float t){vec2 n=floor(x),f=fract(x);float d1=8.,d2=8.;
for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=hash2(n+g);o=.5+.42*sin(t+6.2831*o);
vec2 r=g+o-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}return vec2(sqrt(d1),sqrt(d2)-sqrt(d1));}`,j=`uniform float uSize;varying vec2 vUv;
void main(){vUv=position.xy;vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.);mv.xy+=position.xy*uSize*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}`;function R(o,c,e={uTime:{value:0},uFlare:{value:0},uLight:{value:0},uNoise:{value:q(o)}}){const r=new o.Group,n=new o.Mesh(new o.IcosahedronGeometry(2,24),new o.ShaderMaterial({uniforms:e,vertexShader:`${M}uniform float uTime,uFlare;varying vec3 vP,vN,vV;
void main(){vP=position*.5;float b=vnoise(vP*1.6+vec3(0.,uTime*.25,0.))*2.-1.;vec3 p=position*(1.+b*.035*(1.+uFlare));
vec4 w=modelMatrix*vec4(p,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`${M}uniform float uTime,uFlare,uLight;varying vec3 vP,vN,vV;
void main(){float t=uTime*.12;
vec3 q=vP*1.4+vec3(vfbm(vP*1.2+t),vfbm(vP*1.2-t+4.),0.)*1.6;
float n=(vfbm(q+vec3(0.,-t*2.,t))-.5)*1.4+.5;float cells=vfbm(vP*4.+q);
float h=clamp(n*1.25+cells*.35-.2,0.,1.);
vec3 c=mix(vec3(.18,.01,0.),vec3(.8,.14,.005),smoothstep(.1,.45,h));c=mix(c,vec3(1.25,.45,.06),smoothstep(.45,.78,h));c=mix(c,vec3(1.7,1.05,.4),smoothstep(.88,1.,h));
float fr=pow(clamp(1.-dot(normalize(vN),vV),0.,1.),2.5);c+=vec3(1.,.28,.03)*fr*1.1;
c*=1.+uFlare*.9;if(uLight>.5)c=min(c,vec3(1.))*.95;
gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
}`})),i=new o.Mesh(new o.PlaneGeometry(2,2),new o.ShaderMaterial({uniforms:{...e,uSize:{value:6.4},uAccent:{value:new o.Color(c?.accent??16755251)}},transparent:!0,depthWrite:!1,blending:e.uLight.value>.5?o.NormalBlending:o.AdditiveBlending,vertexShader:j,fragmentShader:`${M}uniform float uTime,uFlare,uLight;varying vec2 vUv;
void main(){vec2 p=vUv*3.2;float r=length(p);if(r<.9)discard;float a=atan(p.y,p.x);vec2 ring=vec2(cos(a),sin(a));
float t=uTime;
float len=.25+2.6*pow(clamp((vfbm(vec3(ring*1.9,t*.2))-.5)*1.5+.5,0.,1.),2.4)*(1.+uFlare*1.2);
float wisp=vfbm(vec3(ring*5.,r*2.2-t*1.3));
float tongue=smoothstep(len*(.55+wisp*.9),0.,r-1.);
float halo=exp(-(r-1.)*3.2)*.55;
float k=clamp((r-1.)/max(len,.01),0.,1.);
vec3 c=mix(vec3(1.5,.75,.2),vec3(1.2,.25,.02),smoothstep(0.,.45,k));c=mix(c,vec3(.6,.05,.01),smoothstep(.45,1.,k));
float a2=clamp(tongue*(.55+wisp*.8)+halo,0.,1.)*smoothstep(.9,1.,r);
if(uLight>.5){c=mix(vec3(1.,.45,.05),vec3(.75,.12,.02),k);a2*=.85;}
gl_FragColor=vec4(c,a2);
#include <colorspace_fragment>
}`}));return i.renderOrder=2,r.add(n,i),r.userData.uniforms=e,r.userData.tick=l=>{e.uTime.value=l},r}export const models={core:(o,c,{light:e=!1}={})=>R(o,c,{uTime:{value:0},uFlare:{value:0},uLight:{value:e?1:0},uNoise:{value:q(o)}})};let L=11;const v=(o,c)=>{L=L+1831565813|0;let e=Math.imul(L^L>>>15,1|L);return e=e+Math.imul(e^e>>>7,61|e)^e,o+((e^e>>>14)>>>0)/4294967296*(c-o)},U=(o,c,e)=>{const r=Math.sin(o*12.9898+c*78.233+e*37.719)*43758.5453;return r-Math.floor(r)};function Z(o,c,e){const r=new t.ConeGeometry(c,o,6+e%3,10,!0);r.translate(0,o/2,0);const n=r.attributes.position,i=v(-.7,.7),l=v(0,6.28);for(let u=0;u<n.count;u++){const f=n.getX(u),F=n.getY(u),w=n.getZ(u),d=F/o,y=Math.round(d*10),b=U(Math.round(f*50),y,Math.round(w*50)+e),z=U(y,e,1.7),N=Math.atan2(w,f)+i*d+(z-.5)*.5,P=Math.hypot(f,w)*(.55+b*.75)*(1+.45*Math.sin(d*7+e)*(1-d))*(d<.15?1.35-d*2.3:1),C=Math.sin(d*3.1)*c*.5;n.setXYZ(u,Math.cos(N)*P+Math.cos(l)*C,F+(z-.5)*o*.06*(y%10?1:0),Math.sin(N)*P+Math.sin(l)*C)}return r}function J(o){const c=[],e=[];let r=0;for(const n of o){const i=n.attributes.position.array;for(const l of i)c.push(l);for(const l of n.index.array)e.push(l+r);r+=i.length/3,n.dispose()}return new t.BufferGeometry().setAttribute("position",new t.Float32BufferAttribute(c,3)).setIndex(e)}export function start(o,c){const e=!!c.light,r=!!c.lite,n=K(t,o,c,{fov:45,fog:null,lights:!1,bloom:{strength:.8,radius:.35,threshold:.6}}),{rig:i,camera:l,scene:u}=n,f={uTime:{value:0},uFlare:{value:0},uLight:{value:e?1:0},uCore:{value:new t.Vector3(0,4.6,0)},uCam:{value:new t.Vector3},uNoise:{value:q(t)}},F=e?t.NormalBlending:t.AdditiveBlending;if(!e){const a=new t.Mesh(new t.SphereGeometry(180,48,24),new t.ShaderMaterial({uniforms:f,side:t.BackSide,depthWrite:!1,vertexShader:"varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`${M}uniform float uTime,uFlare;varying vec3 vD;
void main(){vec3 d=normalize(vD);float h=d.y;
float sm=vfbm(vec3(d.x*2.2,d.y*3.4-uTime*.025,d.z*2.2+uTime*.012));
float lo=exp(-max(h,0.)*16.);float az=atan(d.x,-d.z);float behind=exp(-az*az*1.5);
vec3 col=vec3(.004,.002,.003)+vec3(.035,.006,.003)*sm*sm*exp(-max(h,0.)*3.);
col+=vec3(.2,.035,.008)*lo*(.25+.75*behind)*(.4+sm)*(1.+uFlare*.6);
gl_FragColor=vec4(col,1.);
#include <colorspace_fragment>
}`}));a.renderOrder=1,i.add(a)}const w=[],d=new t.RingGeometry(.5,r?46:70,r?90:150,r?30:48);d.rotateX(-Math.PI/2);const y=d.attributes.position;for(let a=0;a<y.count;a++){const s=y.getX(a),h=y.getZ(a),m=Math.hypot(s,h),x=1-.65*Math.max(0,h/m)**2,g=Math.min(1,Math.max(0,(m-7)/3.5)),_=Math.min(1,Math.max(0,(m-8)/4)),X=m<10.5?-.9+g*g*(3-2*g)*3.4*x:(2.5-Math.min(1,(m-10.5)/14)*2.4)*x;y.setY(a,X+(Math.sin(s*.55)*Math.cos(h*.47)*.6+Math.sin(s*1.7+h*1.3)*.25+Math.sin(s*.21-h*.33)*.9)*_)}w.push(d),L=11;const b=[],z=r?12:22;for(let a=0;a<z;a++){const s=a/z*Math.PI*2+v(-.12,.12),h=(1-Math.cos(s))/2,m=Math.cos(s)>.55;if(Math.cos(s)>.88)continue;const x=m?v(1.6,3.4):v(3.5,6)+h*v(2,5),g=v(7.4,10.5)+(m?1.5:0);b.push([Math.sin(s)*g,Math.cos(s)*g,x,x*v(.13,.2)]),!m&&Math.random()<.7&&b.push([Math.sin(s)*g+v(-1.4,1.4),Math.cos(s)*g+v(-1,1),x*v(.4,.7),x*v(.08,.12)])}for(let a=0;a<(r?5:9);a++){const s=v(2.2,4.1),h=v(26,44),m=v(12,26);b.push([Math.sin(s)*h,Math.cos(s)*h,m,m*v(.16,.24)])}b.forEach(([a,s,h,m],x)=>{const g=Z(h,m,x*7+3),_=new t.Matrix4().makeRotationFromEuler(new t.Euler(v(-.12,.12)-s*.012,v(0,6.28),v(-.12,.12)+a*.012));_.setPosition(a,Math.hypot(a,s)<12?.4:1.2,s),g.applyMatrix4(_),w.push(g)});const N=new t.ShaderMaterial({uniforms:{...f,uHaze:{value:new t.Color(e?15984607:1967619)}},transparent:e,extensions:{derivatives:!0},vertexShader:"varying vec3 vW;void main(){vW=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`${Y.noise}${M}${I}uniform vec3 uCore,uHaze,uCam;uniform float uTime,uFlare,uLight;varying vec3 vW;
void main(){vec3 N=normalize(cross(dFdx(vW),dFdy(vW)));vec3 V=normalize(uCam-vW);if(dot(N,V)<0.)N=-N;
vec3 Lv=uCore-vW;float d=length(Lv);vec3 L=Lv/d;float fall=1./(1.+d*d*.02);float fl=1.+uFlare*1.6;
vec3 core=vec3(1.,.34,.06)*fl;float r=length(vW.xz);
float diff=max(dot(N,L),0.);float spec=pow(max(dot(N,normalize(L+V)),0.),40.);
vec3 R=reflect(-V,N);float poolRef=smoothstep(.05,-.6,R.y)*exp(-max(r-8.,0.)*.12);float horiz=exp(-abs(R.y)*5.);
float fres=.04+.96*pow(clamp(1.-dot(N,V),0.,1.),5.);
float up=smoothstep(uLight>.5?.25:.55,.95,N.y);vec3 base=uLight>.5?mix(vec3(.13,.11,.12),vec3(.5,.45,.44),up):mix(vec3(.012,.009,.014),vec3(.02,.016,.016),up);
vec3 col=base+base*core*diff*fall*3.+core*spec*fall*.9+(vec3(1.,.28,.04)*poolRef*1.1+vec3(.07,.012,.004)*horiz)*fres*fl*(1.-uLight*.7);
float heat=exp(-max(vW.y-.5,0.)*.3)*exp(-max(r-8.,0.)*.6)*smoothstep(.2,.6,vnoise(vW*.09+2.))+exp(-max(r-7.,0.)*1.2)*.35;
if(heat>.004){ // cracks only where there is heat to show them
vec2 uv=abs(N.y)>.6?vW.xz*.55:vec2(dot(vW.xz,normalize(vec2(-N.z,N.x)+1e-4)),vW.y)*vec2(.6,.38);
vec2 v=voro(uv+(vec2(vnoise(vec3(uv*.6,1.)),vnoise(vec3(uv*.6,7.)))-.5)*.8,0.);
float n1=snoise(vW*vec3(.3,.18,.3));
float crack=(1.-smoothstep(0.,.07,v.y))*smoothstep(-.25,.35,n1)+(1.-smoothstep(0.,.03,abs(n1)))*.5;
float halo=(1.-smoothstep(0.,.3,v.y))*.12;
float pulse=.7+.3*sin(uTime*1.4+n1*7.+vW.y*.6+v.x*3.);
vec3 lava=mix(vec3(.85,.1,.008),vec3(1.5,.62,.12),clamp(heat*pulse*1.2,0.,1.));
col+=(lava*crack*pulse*1.9+vec3(.7,.08,.01)*halo)*heat*fl;}
float fd=smoothstep(26.,95.,length(vW-uCam));col=mix(col,uHaze,fd*(uLight>.5?.85:.75));
float alpha=uLight>.5?1.-smoothstep(11.,24.,r)*(1.-smoothstep(4.,9.,vW.y)):1.;
gl_FragColor=vec4(col,alpha);
#include <colorspace_fragment>
}`}),P=new t.Mesh(J(w),N);i.add(P);const C=new t.Mesh(new t.CircleGeometry(8.6,96).rotateX(-Math.PI/2),new t.ShaderMaterial({uniforms:f,vertexShader:"varying vec3 vW;void main(){vW=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`${M}${I}uniform float uTime,uFlare,uLight;varying vec3 vW;
void main(){vec2 p=vW.xz;float r=length(p),t=uTime;float a=t*.025;mat2 R=mat2(cos(a),-sin(a),sin(a),cos(a));
vec2 q=R*p*.62;vec2 w=vec2(vnoise(vec3(q*.45,t*.05)),vnoise(vec3(q*.45+7.3,t*.05)))*2.-1.;
vec2 v=voro(q+w*1.3+vec2(vnoise(vec3(q*1.3,t*.1)))*.35,t*.18);float seam=1.-smoothstep(0.,.16,v.y);
float melt=(vfbm(vec3(q*.6+w,t*.07))-.5)*1.4+.5;float open=smoothstep(.56,.72,melt+.22*(1.-smoothstep(0.,4.,r)));
float tex=vfbm(vec3(q*3.,1.));
vec3 crust=mix(vec3(.02,.006,.004),vec3(.1,.025,.012),tex)+vec3(.7,.08,.01)*seam*seam*.35;
float heat=max(seam*(1.-v.x*.5),open);
vec3 hot=mix(vec3(.85,.14,.01),vec3(1.45,.62,.14),smoothstep(.7,1.,heat)*(.35+.65*open))*(1.+uFlare*.9);
vec3 col=mix(crust,hot,heat);
col=mix(col,crust*.5,smoothstep(6.2,8.,r)*.85);
col+=vec3(1.,.36,.06)*exp(-r*r*.06)*.18*(1.+uFlare);
if(uLight>.5)col=min(col,vec3(1.));
gl_FragColor=vec4(col,1.);
#include <colorspace_fragment>
}`}));i.add(C);const G=new t.Mesh(new t.PlaneGeometry(2,2),new t.ShaderMaterial({uniforms:{...f,uSize:{value:17}},transparent:!0,depthWrite:!1,vertexShader:j,fragmentShader:`${M}uniform float uTime,uFlare,uLight;varying vec2 vUv;
void main(){vec2 p=vUv;float y=p.y*.5+.5,t=uTime*.05;
float wdt=.18+y*.75;float m=smoothstep(wdt,wdt*.25,abs(p.x+sin(y*3.+t*4.)*.08))*smoothstep(0.,.18,y)*smoothstep(1.,.55,y);
if(m<.003)discard;
vec3 q=vec3(p.x*1.6,y*2.2-t*3.,t);float d=(vfbm(q+vfbm(q*1.7)*.8)-.5)*1.5+.5;
float a=smoothstep(.42,.75,d)*m;
vec3 lit=mix(vec3(.5,.11,.02),vec3(.035,.02,.02),smoothstep(.05,.5,y))*(1.+uFlare*.8);
vec3 c=uLight>.5?mix(vec3(.55,.38,.32),vec3(.72,.66,.64),y):lit*(.6+.6*d);
gl_FragColor=vec4(c,a*(uLight>.5?.35:.8));
#include <colorspace_fragment>
}`}));G.position.set(0,14,-7),i.add(G);const W=R(t,c.colors,f);W.position.copy(f.uCore.value),i.add(W);const S=new t.Mesh(new t.PlaneGeometry(40,40).rotateX(-Math.PI/2),new t.ShaderMaterial({uniforms:{...f,uR:{value:0},uA:{value:0}},transparent:!0,depthWrite:!1,blending:F,vertexShader:"varying vec2 vP;void main(){vP=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`uniform float uR,uA,uLight;varying vec2 vP;void main(){float r=length(vP);float x=(r-uR)/(.6+uR*.08);float k=exp(-x*x);
vec3 c=uLight>.5?vec3(.9,.3,.03):vec3(1.6,.6,.15);gl_FragColor=vec4(c,k*uA);
#include <colorspace_fragment>
}`}));S.position.y=.25,i.add(S);const k=new t.Mesh(new t.PlaneGeometry(2,2),new t.ShaderMaterial({uniforms:{...f,uSize:{value:9}},transparent:!0,depthWrite:!1,blending:F,vertexShader:j,fragmentShader:`${M}uniform float uTime,uLight;varying vec2 vUv;
void main(){vec2 p=vUv;float y=p.y*.5+.5;float t=uTime;
float s=vnoise(vec3(p.x*3.+sin(y*14.-t*2.5)*.25,y*2.4-t*.9,t*.2))*2.-1.;
float m=smoothstep(1.,.15,abs(p.x))*smoothstep(0.,.12,y)*smoothstep(1.,.35,y);if(m<.003)discard;
float a=smoothstep(.3,.9,s)*m*.16;
gl_FragColor=vec4(uLight>.5?vec3(.9,.4,.1):vec3(1.,.42,.12),a);
#include <colorspace_fragment>
}`}));k.position.set(0,7.5,0),k.renderOrder=3,i.add(k);const A=r?900:e?1600:3200,B=new Float32Array(A*4);for(let a=0;a<A;a++){const s=Math.random()<.22;B.set([V(0,6.283),s?V(.5,2.2):Math.sqrt(Math.random())*9.5,Math.random(),s?1+Math.random():Math.random()],a*4)}const O=new t.BufferGeometry().setAttribute("position",new t.Float32BufferAttribute(new Float32Array(A*3),3)).setAttribute("seed",new t.Float32BufferAttribute(B,4)),T=new t.Points(O,new t.ShaderMaterial({uniforms:{...f,uScale:{value:400}},transparent:!0,depthWrite:!1,blending:F,vertexShader:`uniform float uTime,uScale,uFlare;uniform vec3 uCore;attribute vec4 seed;varying float vLife,vF;varying float vK;
void main(){bool fc=seed.w>=1.;float sp=fc?.9:.45+fract(seed.w*3.1)*.6;
float life=fract(seed.z+uTime*sp*.075);
float h=life*(fc?9.:17.);float ang=seed.x+life*(fc?2.6:1.4)+sin(uTime*.6+seed.z*30.)*.25;
float rr=seed.y*(1.+life*(fc?1.8:.55));vec3 p=vec3(cos(ang)*rr,h+(fc?uCore.y-1.:-.2),sin(ang)*rr);
p.x+=sin(uTime*1.2+seed.z*31.+h*.55)*.8*life;p.z+=cos(uTime*1.+seed.z*17.+h*.45)*.8*life;
vec4 mv=modelViewMatrix*vec4(p,1.);vLife=life;vF=fract(seed.z*91.7);vK=fc?1.:0.;
gl_PointSize=uScale*(.22+.4*fract(seed.z*7.3))*(1.-life*.55)*(1.+uFlare*.6)/-mv.z;gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform float uTime,uLight,uFlare;varying float vLife,vF,vK;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);a*=a;
float fl=.65+.35*sin(uTime*(9.+vF*14.)+vF*40.);
vec3 c=mix(vec3(2.2,1.5,.6),vec3(1.6,.42,.06),smoothstep(0.,.35,vLife));c=mix(c,vec3(.5,.05,.01),smoothstep(.35,1.,vLife));
float al=a*fl*smoothstep(0.,.06,vLife)*(1.-smoothstep(.75,1.,vLife))*(1.+uFlare*.5);
if(uLight>.5){c=mix(vec3(1.,.42,.04),vec3(.55,.06,.02),vLife);al=smoothstep(.5,.25,d)*smoothstep(0.,.06,vLife)*(1.-smoothstep(.5,.9,vLife))*.75;}
gl_FragColor=vec4(c,al);
#include <colorspace_fragment>
}`}));T.frustumCulled=!1,i.add(T);const D=new t.Vector3(-i.position.x*.2,3.4,0);l.position.set(0,7.2,25),l.lookAt(D);let $=4,p=-1;return n.run((a,s)=>{f.uTime.value=a,i.worldToLocal(f.uCam.value.copy(l.position)),a>$&&(p=0,$=a+V(7,12)),p>=0&&(p+=s,f.uFlare.value=p<.25?p/.25:Math.exp(-(p-.25)*1.6),S.material.uniforms.uR.value=p*9,S.material.uniforms.uA.value=Math.max(0,1-p/2.2)*.8,p>4&&(p=-1)),S.visible=p>=0,T.material.uniforms.uScale.value=n.renderer.domElement.height*.5,W.rotation.y=a*.08,W.position.y=f.uCore.value.y+Math.sin(a*.6)*.18,l.position.x=n.pointer.x*1.4+Math.sin(a*.07)*.6,l.position.y=7.2+n.pointer.y*.8,l.lookAt(D)}),n}
