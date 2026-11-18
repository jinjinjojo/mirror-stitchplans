import*as e from"../vendor/three/build/three.module.min.js";import{stage as G,GLSL as N}from"./index.js";export const meta={name:"Tidal",blurb:"Under the waves: caustics, light shafts and jellyfish",element:"water",colors:"native"};const U=`
float caustic(vec2 uv,float time){vec2 p=mod(uv*6.28318,6.28318)-250.;vec2 i=p;float c=1.,inten=.005;
for(int n=0;n<4;n++){float t=time*(1.-(3.5/float(n+1)));i=p+vec2(cos(t-i.x)+sin(t+i.y),sin(t-i.y)+cos(t+i.x));
c+=1./length(vec2(p.x/(sin(i.x+t)/inten),p.y/(cos(i.y+t)/inten)));}
c/=4.;c=1.17-pow(c,1.4);return pow(abs(c),8.);}`;let P=5;const r=(a=0,f=1)=>{P=P+1831565813|0;let i=Math.imul(P^P>>>15,1|P);return i=i+Math.imul(i^i>>>7,61|i)^i,a+((i^i>>>14)>>>0)/4294967296*(f-a)};function W(a,{color:f=6288127,color2:i=16736210,light:v=!1,rate:g=.55,phase:d=0,tentacles:h=16}={}){const w=new a.Group,c={uTime:{value:0},uPulse:{value:0},uLight:{value:v?1:0},uColor:{value:new a.Color(f).multiplyScalar(v?.55:1)},uColor2:{value:new a.Color(i).multiplyScalar(v?.7:1)},uRim:{value:h}},m=v?a.NormalBlending:a.AdditiveBlending,S=new a.Mesh(new a.SphereGeometry(1,56,22,0,Math.PI*2,0,Math.PI/2),new a.ShaderMaterial({uniforms:c,transparent:!0,depthWrite:!1,side:a.DoubleSide,blending:m,vertexShader:`uniform float uPulse;varying vec3 vN,vV,vP;
void main(){vec3 p=position;float k=1.-clamp(p.y,0.,1.);float ang=atan(p.z,p.x);
float lap=1.+.06*sin(ang*8.)*smoothstep(.7,1.,k);
p.xz*=(1.-uPulse*.24*k*k)*lap*(1.+.06*(1.-uPulse)*k);p.y=p.y*(.72+uPulse*.22)-uPulse*.06*k;
vec4 w=modelMatrix*vec4(p,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);vP=position;
gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform vec3 uColor,uColor2;uniform float uTime,uPulse,uLight;varying vec3 vN,vV,vP;
void main(){float fr=pow(clamp(1.-abs(dot(normalize(vN),vV)),0.,1.),2.);
float ang=atan(vP.z,vP.x),k=1.-clamp(vP.y,0.,1.);
float canals=pow(abs(cos(ang*4.)),40.)*smoothstep(.15,.9,k)*.7+pow(abs(cos(ang*4.+.785)),60.)*smoothstep(.5,.95,k)*.35;
float gon=smoothstep(.13,.02,abs(k-.3-.06*sin(ang*4.)))*pow(abs(cos(ang*2.)),1.5);
float rim=smoothstep(.8,1.,k);float dots=pow(abs(cos(ang*12.)),24.)*rim;
float glow=.65+.35*uPulse;
vec3 c=uColor*(.16+fr*1.1+rim*.9+canals*1.2)*glow+uColor2*(gon*1.4+dots*2.);
float a=clamp(.18+fr*.55+rim*.35+gon*.5,0.,1.);
if(uLight>.5){c=uColor*(.6+.4*fr)+uColor2*gon*.5;a=clamp(.1+fr*.5+rim*.3+canals*.4+gon*.45,0.,.85);}
gl_FragColor=vec4(c,a);
#include <colorspace_fragment>
}`}));S.renderOrder=4;const x=28,T=h+4,b=[],z=[],k=[],y=[],A=[];for(let l=0;l<T;l++)for(let n=0;n<=x;n++)for(const s of[-1,1])b.push(0,0,0),z.push(n/x),k.push(s),y.push(l);for(let l=0;l<T;l++)for(let n=0;n<x;n++){const s=(l*(x+1)+n)*2;A.push(s,s+1,s+2,s+1,s+3,s+2)}const R=new a.BufferGeometry().setAttribute("position",new a.Float32BufferAttribute(b,3)).setAttribute("aT",new a.Float32BufferAttribute(z,1)).setAttribute("aSide",new a.Float32BufferAttribute(k,1)).setAttribute("aId",new a.Float32BufferAttribute(y,1)).setIndex(A),M=new a.Mesh(R,new a.ShaderMaterial({uniforms:c,transparent:!0,depthWrite:!1,side:a.DoubleSide,blending:m,vertexShader:`uniform float uTime,uPulse,uRim;attribute float aT,aSide,aId;varying float vT,vS,vId,vOral;
vec3 at(float t,float id){bool oral=id>=uRim;float h=fract(sin(id*12.9898)*43758.5453);
float ang=oral?(id-uRim)*1.5708+.4:id/uRim*6.2832;float rad=oral?.16:.9*(1.-uPulse*.2);
float len=oral?2.6+h*.8:5.+h*3.;float r=rad*(1.-t*(oral?.2:.35))+(oral?.12*sin(t*14.-uTime*2.+id):0.);
vec3 p=vec3(cos(ang)*r,-t*len-(oral?.15:.05),sin(ang)*r);
p.x+=sin(t*4.5-uTime*1.4+id*1.3)*.32*t+sin(t*2.1-uTime*.6+id)*.45*t*t;
p.z+=cos(t*3.8-uTime*1.1+id*2.1)*.28*t;p.y+=sin(t*6.-uTime*2.2)*.12*t*uPulse;return p;}
void main(){vec3 c=at(aT,aId),c2=at(aT+.01,aId);vec4 w=modelMatrix*vec4(c,1.);vec3 tn=mat3(modelMatrix)*(c2-c);
vec3 sd=normalize(cross(tn,cameraPosition-w.xyz));bool oral=aId>=uRim;
w.xyz+=sd*aSide*(oral?.13:.032)*(1.-aT*.55)*length(modelMatrix[0].xyz);
vT=aT;vS=aSide;vId=aId;vOral=oral?1.:0.;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform vec3 uColor,uColor2;uniform float uTime,uLight;varying float vT,vS,vId,vOral;
void main(){float a=1.-abs(vS);a*=a;float fade=(1.-vT)*smoothstep(0.,.04,vT);
float beads=.55+.45*sin(vT*(vOral>.5?40.:110.)-uTime*3.+vId);
vec3 c=mix(uColor,uColor2,vOral*.7+vT*.3)*beads;
float al=a*fade*(vOral>.5?.75:.9);if(uLight>.5){c=mix(uColor,uColor2,vOral*.6)*.85;al*=.7;}
gl_FragColor=vec4(c,al);
#include <colorspace_fragment>
}`}));return M.frustumCulled=!1,M.renderOrder=3,w.add(M,S),w.userData.uniforms=c,w.userData.tick=l=>{const n=(l*g+d)%1;c.uPulse.value=n<.28?Math.sin(n/.28*Math.PI/2):Math.cos((n-.28)/.72*Math.PI/2)**2,c.uTime.value=l},w}export const models={jellyfish:(a,f,{light:i=!1}={})=>W(a,{color:6288127,color2:f?.accent??16736210,light:i})};export function start(a,f){const i=!!f.light,v=!!f.lite,g=G(e,a,f,{fov:55,fog:null,lights:!1,bloom:{strength:.85,radius:.6,threshold:.42}}),{rig:d,camera:h}=g;P=5;const w=16,c=new e.Vector3(.362,.518,-.776).normalize(),m={uTime:{value:0},uLight:{value:i?1:0},uCam:{value:new e.Vector3},uSun:{value:c}},S=i?e.NormalBlending:e.AdditiveBlending,x=`vec3 water(vec3 d,vec3 sun,float light){float s=pow(max(dot(d,normalize(vec3(sun.x,.35,sun.z))),0.),4.);
if(light>.5)return mix(vec3(.5,.76,.82),vec3(.82,.95,.97),smoothstep(-.3,.45,d.y))+vec3(.08,.06,0.)*s;
return mix(vec3(.0,.004,.014),vec3(.0,.05,.085),smoothstep(-.3,.3,d.y))+vec3(.0,.05,.06)*s*smoothstep(-.2,.3,d.y);}`,T=new e.Mesh(new e.SphereGeometry(170,40,20),new e.ShaderMaterial({uniforms:m,side:e.BackSide,depthWrite:!1,transparent:i,vertexShader:"varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`${x}uniform float uLight;uniform vec3 uSun;varying vec3 vD;
void main(){vec3 d=normalize(vD);gl_FragColor=vec4(water(d,uSun,uLight),uLight>.5?smoothstep(-.5,.2,d.y)*.92:1.);
#include <colorspace_fragment>
}`}));T.renderOrder=-2,d.add(T);const b=new e.Mesh(new e.PlaneGeometry(240,240).rotateX(Math.PI/2),new e.ShaderMaterial({uniforms:m,transparent:!0,depthWrite:!1,vertexShader:`varying vec3 vW;void main(){vW=position+vec3(0.,${w}.,0.);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`${N.noise}${U}${x}uniform float uTime,uLight;uniform vec3 uCam,uSun;varying vec3 vW;
vec2 grad(vec2 p,float t){vec2 g=vec2(0.);float a=.2,k=.32,ang=.6;
for(int i=0;i<6;i++){vec2 d=vec2(cos(ang),sin(ang));float ph=dot(d,p)*k+t*sqrt(9.8*k)*.8;
g+=a*k*cos(ph)*(1.+.6*sin(ph))*d;a*=.56;k*=1.8;ang+=2.17;}return g;}
void main(){vec2 p=vW.xz;float t=uTime;vec2 g=grad(p,t)+vec2(snoise(vec3(p*.5,t*.5)),snoise(vec3(p*.5+9.,t*.5)))*.035;
vec3 nUp=normalize(vec3(-g.x,1.,-g.y));vec3 V=normalize(vW-uCam);float dist=length(vW-uCam);
vec3 R=refract(V,-nUp,1.33);bool tir=dot(R,R)<1e-4;
float cau=caustic(p*.045+g*.6,t*.3);
vec3 col=vec3(.0,.03,.05)+vec3(.0,.04,.05)*(.5+.5*dot(nUp,normalize(vec3(.3,1.,.2))))+vec3(.1,.35,.4)*cau*.35;
float win=0.;
if(!tir){win=smoothstep(.0,.45,R.y);vec3 sky=mix(vec3(.22,.55,.66),vec3(.5,.82,.92),R.y);
float sd=max(dot(R,uSun),0.);sky+=vec3(1.,.95,.82)*(pow(sd,600.)*5.+pow(sd,24.)*.7);
col=mix(col,sky*(.75+cau*.9),win);}
float fogk=1.-exp(-dist*.032);vec3 fogc=water(V,uSun,uLight);
if(uLight>.5){col=mix(vec3(.6,.84,.88),vec3(.98,1.,1.),win)+vec3(.9,1.,1.)*cau*.3*(1.-win*.5);}
gl_FragColor=vec4(mix(col,fogc,fogk),uLight>.5?1.-fogk*.85:1.);
#include <colorspace_fragment>
}`}));b.position.y=w,b.renderOrder=-1,d.add(b);const z=new e.Vector3(-c.x/1.33,-Math.sqrt(1-(c.x**2+c.z**2)/1.769),-c.z/1.33),k=v?10:22,y=8,A=[],R=[],M=[];for(let t=0;t<k;t++){const u=[r(-12,28),w,r(-40,8)],L=r(26,42),C=r(.25,1.3);for(let o=0;o<=y;o++)for(const p of[-1,1])A.push(...u),R.push(o/y,p,t,Math.round(L)*100+C);for(let o=0;o<y;o++){const p=(t*(y+1)+o)*2;M.push(p,p+1,p+2,p+1,p+3,p+2)}}const l=new e.BufferGeometry().setAttribute("position",new e.Float32BufferAttribute(A,3)).setAttribute("aRay",new e.Float32BufferAttribute(R,4)).setIndex(M),n=new e.Mesh(l,new e.ShaderMaterial({uniforms:{...m,uDir:{value:z}},transparent:!0,depthWrite:!1,side:e.DoubleSide,blending:S,vertexShader:`attribute vec4 aRay;uniform vec3 uCam,uDir;uniform float uTime;varying float vT,vS,vId,vD;
void main(){float len=floor(aRay.w/100.),w=fract(aRay.w/100.)*100.;
vec3 p=position+uDir*len*aRay.x;vec3 sd=normalize(cross(uDir,uCam-p));
p+=sd*aRay.y*w*(1.+aRay.x*1.6)*(1.+.25*sin(uTime*.5+aRay.z*3.));
vT=aRay.x;vS=aRay.y;vId=aRay.z;vD=length(uCam-p);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`uniform float uTime,uLight;varying float vT,vS,vId,vD;
void main(){float across=exp(-vS*vS*3.5);
float fl=.5+.5*sin(uTime*(.3+fract(vId*.37)*.5)+vId*2.7);fl*=.7+.3*sin(vT*9.-uTime*1.2+vId);
float a=across*pow(1.-vT,1.8)*smoothstep(0.,.05,vT)*fl*exp(-vD*.018);
vec3 c=vec3(.4,.9,.95);if(uLight>.5){c=vec3(1.);a*=1.3;}
gl_FragColor=vec4(c,a*.36);
#include <colorspace_fragment>
}`}));n.frustumCulled=!1,d.add(n);const s=v?260:700,D=new Float32Array(s*4),j=[[9,-2],[17,-12],[3,-18],[22,2]];for(let t=0;t<s;t++){const u=r()<.7?j[t%4]:[r(-14,30),r(-30,10)];D.set([u[0]+r(-.5,.5),u[1]+r(-.5,.5),r(),r(.6,1.4)],t*4)}const _=new e.Points(new e.BufferGeometry().setAttribute("position",new e.Float32BufferAttribute(new Float32Array(s*3),3)).setAttribute("seed",new e.Float32BufferAttribute(D,4)),new e.ShaderMaterial({uniforms:{...m,uScale:{value:400}},transparent:!0,depthWrite:!1,blending:S,vertexShader:`uniform float uTime,uScale;attribute vec4 seed;varying float vA;
void main(){float life=fract(seed.z+uTime*seed.w*.045);float y=-12.+life*27.5;
vec3 p=vec3(seed.x+sin(uTime*2.3+seed.z*40.)*.18*(.3+life),y,seed.y+cos(uTime*1.9+seed.z*31.)*.18*(.3+life));
vec4 mv=modelViewMatrix*vec4(p,1.);vA=smoothstep(0.,.08,life)*(1.-smoothstep(.93,1.,life));
gl_PointSize=uScale*(.09+.2*fract(seed.z*13.7))*(.7+life*.7)/-mv.z;gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform float uLight;varying float vA;
void main(){vec2 q=gl_PointCoord-.5;float d=length(q);if(d>.5)discard;
float ring=smoothstep(.5,.42,d)*smoothstep(.22,.44,d);float hi=smoothstep(.13,.0,length(q-vec2(-.16,-.16)));
float a=(ring*.7+hi)*vA;vec3 c=vec3(.75,.97,1.);if(uLight>.5){c=vec3(.1,.5,.6);a*=.8;}
gl_FragColor=vec4(c,a*.75);
#include <colorspace_fragment>
}`}));_.frustumCulled=!1,d.add(_);const B=v?1600:5e3,F=new Float32Array(B*4);for(let t=0;t<B;t++)F.set([r(-34,40),r(-14,15),r(-46,16),r()],t*4);const I=new e.Points(new e.BufferGeometry().setAttribute("position",new e.Float32BufferAttribute(new Float32Array(B*3),3)).setAttribute("seed",new e.Float32BufferAttribute(F,4)),new e.ShaderMaterial({uniforms:{...m,uScale:{value:400},uAccent:{value:new e.Color(f.colors.accent)}},transparent:!0,depthWrite:!1,blending:S,vertexShader:`uniform float uTime,uScale;uniform vec3 uCam;attribute vec4 seed;varying float vB,vTw,vK;
void main(){vec3 p=seed.xyz;float t=uTime;p.x+=sin(t*.11+seed.w*60.)*1.2+t*.08;p.y+=sin(t*.17+seed.w*40.)*.8-t*.05;p.z+=cos(t*.13+seed.w*50.)*1.;
p.x=mod(p.x+34.,74.)-34.;p.y=mod(p.y+14.,29.)-14.;
vec4 mv=modelViewMatrix*vec4(p,1.);vK=seed.w>.92?1.:0.;vB=seed.w>.985?1.:0.;
vTw=.5+.5*sin(t*(1.+seed.w*3.)+seed.w*90.);
gl_PointSize=uScale*(vK>.5?.2:.08)*(.6+.8*fract(seed.w*37.))/-mv.z;gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform float uLight;uniform vec3 uAccent;varying float vB,vTw,vK;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);a*=a;
vec3 c=vK>.5?mix(vec3(.3,1.,.9),uAccent,vB)*(1.+vTw*1.6):vec3(.55,.8,.85)*.7;float al=a*(vK>.5?.4+.6*vTw:.45+.35*vTw);
if(uLight>.5){c=vK>.5?vec3(0.,.55,.6):vec3(.2,.45,.5);al*=.6;}
gl_FragColor=vec4(c,al);
#include <colorspace_fragment>
}`}));I.frustumCulled=!1,d.add(I);const O=[{color:6549759,color2:16739029,at:[.5,6.2,7],s:1.45,rate:.5,phase:0,drift:.7},{color:11570175,color2:7012321,at:[13,12.6,-7],s:1.15,rate:.62,phase:.4,drift:1.1},{color:16743129,color2:9427199,at:[-2.6,11.2,-12],s:.9,rate:.7,phase:.75,drift:1.4}].slice(0,v?2:3).map(t=>{const u=W(e,{...t,light:i,tentacles:v?10:16});return u.scale.setScalar(t.s),u.position.set(...t.at),d.add(u),{j:u,o:t}}),V=new e.Vector3(-d.position.x*.25,9,0);return h.position.set(0,0,22),h.lookAt(V),g.run((t,u)=>{m.uTime.value=t,d.worldToLocal(m.uCam.value.copy(h.position));const L=g.renderer.domElement.height*.5;_.material.uniforms.uScale.value=I.material.uniforms.uScale.value=L;for(const{j:C,o}of O){C.userData.tick(t,u);const p=C.userData.uniforms.uPulse.value;C.position.set(o.at[0]+Math.sin(t*.07*o.drift+o.phase*6)*2.2,o.at[1]+Math.sin(t*.11*o.drift+o.phase*4)*1.6+p*.25,o.at[2]+Math.cos(t*.05*o.drift)*1.5),C.rotation.set(Math.sin(t*.13+o.phase*5)*.18,t*.05,Math.cos(t*.1+o.phase*3)*.16)}h.position.set(g.pointer.x*1.2+Math.sin(t*.09)*.5,Math.sin(t*.21)*.35+g.pointer.y*.6,22),h.lookAt(V)}),g}
