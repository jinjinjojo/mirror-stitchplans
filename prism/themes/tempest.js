import*as a from"../vendor/three/build/three.module.min.js";import{stage as q,GLSL as X}from"./index.js";export const meta={name:"Tempest",blurb:"A storm core crackling with lightning",element:"lightning",colors:"native"};const Q=`uniform sampler2D uNoise;
float vnoise(vec3 x){vec3 p=floor(x),f=fract(x);f=f*f*(3.-2.*f);vec2 uv=p.xy+vec2(37.,17.)*p.z+f.xy;vec2 rg=texture2D(uNoise,(uv+.5)/256.).yx;return mix(rg.x,rg.y,f.z);}
float vfbm(vec3 p){float f=0.,a=.5;for(int i=0;i<4;i++){f+=a*vnoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return f/.9375;}`;function j(o){const l=new Uint8Array(65536),g=new Uint8Array(256*256*4);for(let n=0;n<l.length;n++)l[n]=Math.random()*256;for(let n=0;n<256;n++)for(let p=0;p<256;p++){const d=n*256+p;g[d*4]=l[(n+17)%256*256+(p+37)%256],g[d*4+1]=l[d],g[d*4+3]=255}const f=new o.DataTexture(g,256,256);return f.wrapS=f.wrapT=o.RepeatWrapping,f.magFilter=f.minFilter=o.LinearFilter,f.needsUpdate=!0,f}const t=(o=0,h=1)=>o+Math.random()*(h-o),Y=`uniform float uSize;varying vec2 vUv;
void main(){vUv=position.xy;vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.);mv.xy+=position.xy*uSize*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}`;function H(o,{segments:h=1200,slots:l=16,glow:g=10124287,light:f=!1}={}){const n=h*4,p=new Float32Array(n*3),d=new Float32Array(n*3),x=new Float32Array(n*4),U=[];for(let c=0;c<h;c++){const s=c*4;U.push(s,s+1,s+2,s+1,s+3,s+2)}const P=new o.BufferGeometry;P.setAttribute("position",new o.BufferAttribute(new Float32Array(n*3),3));const W=new o.BufferAttribute(p,3),R=new o.BufferAttribute(d,3),B=new o.BufferAttribute(x,4);P.setAttribute("aA",W).setAttribute("aB",R).setAttribute("aQ",B).setIndex(U);const M=new Float32Array(l),k=new o.Mesh(P,new o.ShaderMaterial({uniforms:{uSlot:{value:M},uGlow:{value:new o.Color(g)},uLight:{value:f?1:0}},transparent:!0,depthWrite:!1,side:o.DoubleSide,blending:f?o.NormalBlending:o.AdditiveBlending,vertexShader:`attribute vec3 aA,aB;attribute vec4 aQ;uniform float uSlot[${l}];varying float vS,vI;
void main(){vec3 P=mix(aA,aB,aQ.x);vec4 w=modelMatrix*vec4(P,1.);vec3 d=mat3(modelMatrix)*(aB-aA);float sc=length(modelMatrix[0].xyz);
vec3 sd=normalize(cross(d,cameraPosition-w.xyz)+1e-6);w.xyz+=normalize(d+1e-6)*(aQ.x*2.-1.)*aQ.z*.6*sc+sd*aQ.y*aQ.z*sc;
vS=aQ.y;vI=uSlot[int(aQ.w)];gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform vec3 uGlow;uniform float uLight;varying float vS,vI;
void main(){float x=abs(vS);float core=exp(-x*x*28.),glow=exp(-x*x*4.);
vec3 c=vec3(1.15,1.2,1.6)*core+uGlow*glow*.75;float a=(core+glow*.45)*vI;
if(uLight>.5){c=mix(uGlow*.55,vec3(.12,.06,.3),core);a=(core*.95+glow*.25)*vI;}
gl_FragColor=vec4(c,clamp(a,0.,1.));
#include <colorspace_fragment>
}`}));k.frustumCulled=!1,k.renderOrder=5;const N=Math.floor(h/l),_=new Int32Array(l),G=(c,s,S)=>new o.Vector3(c,s,S),I=G(),w=G(),E=(c,s,S,L)=>{if(_[c]>=N)return;const v=c*N+_[c]++;for(let y=0;y<4;y++){const F=v*4+y;p.set([s.x,s.y,s.z],F*3),d.set([S.x,S.y,S.z],F*3),x.set([y>>1,y&1?1:-1,L,c],F*4)}},D=(c,s,S,L)=>{let v=[c,s],y=c.distanceTo(s)*L;for(let F=0;F<S;F++){const z=[v[0]];for(let b=1;b<v.length;b++){const u=v[b-1],e=v[b],i=u.clone().add(e).multiplyScalar(.5);w.subVectors(e,u).cross(I.set(t(-1,1),t(-1,1),t(-1,1))).normalize(),z.push(i.addScaledVector(w,t(-1,1)*y),e)}v=z,y*=.56}return v},O=(c,s,S,{gens:L=6,rough:v=.2,width:y=.2,forks:F=5,depth:z=1}={})=>{if(z===1){_[c]=0;for(let u=c*N;u<(c+1)*N;u++)for(let e=0;e<4;e++)x[(u*4+e)*4+2]=0}const b=D(s,S,L,v);for(let u=1;u<b.length;u++)E(c,b[u-1],b[u],y*(1-u/b.length*.45));if(z<3)for(let u=0;u<F;u++){const e=Math.floor(t(.08,.75)*b.length),i=b[e],m=S.clone().sub(s).normalize(),A=i.clone().addScaledVector(m.add(I.set(t(-1,1),t(-.6,.3),t(-1,1)).multiplyScalar(.9)).normalize(),s.distanceTo(S)*t(.15,.4)/z);O(c,i,A,{gens:Math.max(2,L-2),rough:v*1.1,width:y*.5,forks:z===1?1:0,depth:z+1})}W.needsUpdate=R.needsUpdate=B.needsUpdate=!0};return{mesh:k,bolt:O,level:M}}function $(o,h,l={uTime:{value:0},uFlash:{value:0},uLight:{value:0},uNoise:{value:j(o)}}){const g=new o.Group,f=new o.Color(h?.accent??10124287),n=new o.Mesh(new o.IcosahedronGeometry(1.5,20),new o.ShaderMaterial({uniforms:{...l,uAccent:{value:f}},vertexShader:"varying vec3 vP,vN,vV;void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}",fragmentShader:`${X.noise}${Q}uniform float uTime,uFlash,uLight;uniform vec3 uAccent;varying vec3 vP,vN,vV;
void main(){vec3 p=normalize(vP);float t=uTime;
float f1=1.-abs(snoise(p*2.2+vec3(0.,t*.9,t*.4)));float f2=1.-abs(snoise(p*4.5-vec3(t*1.3,0.,t*.7)));
float fil=pow(f1,18.)+pow(f2,26.)*.7;float fr=pow(clamp(1.-dot(normalize(vN),vV),0.,1.),2.);
float body=vfbm(p*3.+vec3(t*.3));
vec3 c=mix(vec3(.02,.01,.12),vec3(.16,.08,.5),body)+vec3(.9,.95,1.5)*fil+mix(vec3(.35,.22,.95),uAccent,.35)*fr*.9;
c*=1.+uFlash*.6;if(uLight>.5)c=mix(vec3(.25,.12,.6),vec3(.08,.03,.25),fil)+vec3(.3,.2,.7)*fr;
gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
}`})),p=new o.Mesh(new o.PlaneGeometry(2,2),new o.ShaderMaterial({uniforms:{...l,uSize:{value:5.5}},transparent:!0,depthWrite:!1,blending:l.uLight.value>.5?o.NormalBlending:o.AdditiveBlending,vertexShader:Y,fragmentShader:`${Q}uniform float uTime,uFlash,uLight;varying vec2 vUv;
void main(){float r=length(vUv)*3.667;if(r<1.)discard;float a=atan(vUv.y,vUv.x);
float n=vfbm(vec3(cos(a)*2.,sin(a)*2.,r*1.5-uTime*2.));
float g=exp(-(r-1.)*2.2)*(.4+.6*n)*.7*(1.+uFlash);vec3 c=mix(vec3(.9,.85,1.6),vec3(.35,.2,1.),clamp(r-1.,0.,1.));
if(uLight>.5){c=vec3(.42,.3,.9);g*=.7;}
gl_FragColor=vec4(c,clamp(g,0.,1.)*.9);
#include <colorspace_fragment>
}`}));return p.renderOrder=4,g.add(n,p),g.userData.uniforms=l,g.userData.tick=d=>{l.uTime.value=d},g}export const models={core:(o,h,{light:l=!1}={})=>$(o,h,{uTime:{value:0},uFlash:{value:0},uLight:{value:l?1:0},uNoise:{value:j(o)}})};export function start(o,h){const l=!!h.light,g=!!h.lite,f=q(a,o,h,{fov:50,fog:null,lights:!1,bloom:{strength:.75,radius:.22,threshold:.62}}),{rig:n,camera:p}=f,d=new a.Vector3(0,8,0),x={uTime:{value:0},uFlash:{value:0},uLight:{value:l?1:0},uCam:{value:new a.Vector3},uF:{value:[new a.Vector4,new a.Vector4,new a.Vector4]},uStrike:{value:new a.Vector4},uNoise:{value:j(a)}},U=l?a.NormalBlending:a.AdditiveBlending;if(!l){const e=new a.Mesh(new a.SphereGeometry(180,40,20),new a.ShaderMaterial({uniforms:x,side:a.BackSide,depthWrite:!1,vertexShader:"varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`${Q}uniform float uTime,uFlash;varying vec3 vD;
void main(){vec3 d=normalize(vD);float h=d.y;float n=vfbm(vec3(d.x*3.,d.y*6.,d.z*3.)+uTime*.01);
vec3 c=mix(vec3(.03,.03,.07),vec3(.006,.006,.016),smoothstep(-.05,.5,h));c+=vec3(.05,.04,.12)*n*exp(-abs(h)*6.);
c*=1.+uFlash*(1.+1.5*n);gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
}`}));e.renderOrder=-3,n.add(e)}const P=new a.Mesh(new a.CircleGeometry(160,64).rotateX(-Math.PI/2),new a.ShaderMaterial({uniforms:{...x,uCore:{value:d}},transparent:!0,depthWrite:!1,vertexShader:"varying vec3 vW;void main(){vW=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`${Q}uniform float uTime,uFlash,uLight;uniform vec3 uCam,uCore;uniform vec4 uStrike;varying vec3 vW;
vec2 n2(vec3 p){return vec2(vnoise(p),vnoise(p+vec3(19.,7.,3.)))*2.-1.;}
void main(){vec2 p=vW.xz;float t=uTime;
vec2 g=n2(vec3(p*.7,t*.7))*.13+n2(vec3(p*2.2,t*1.3))*.12+n2(vec3(p*6.,t*2.))*.06;
vec3 V=normalize(uCam-vW);float dist=length(uCam-vW);g*=smoothstep(90.,10.,dist);vec3 n=normalize(vec3(g.x,1.,g.y));
vec3 R=reflect(-V,n);float fres=.02+.98*pow(clamp(1.-dot(n,V),0.,1.),5.);
vec3 toC=normalize(uCore-vW);float glint=pow(max(dot(R,toC),0.),90.)*1.4+pow(max(dot(R,toC),0.),10.)*.07;
vec3 env=mix(vec3(.03,.03,.07),vec3(.006,.006,.016),smoothstep(0.,.5,R.y));
vec2 cell=floor(p*1.6),f=fract(p*1.6)-.5;float h=fract(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453);float pr=fract(t*1.3+h*7.);
float ring=smoothstep(.05,0.,abs(length(f-(vec2(h,fract(h*13.))-.5)*.5)-pr*.32))*(1.-pr)*step(.55,h)*smoothstep(28.,8.,dist);
vec3 c=vec3(.002,.003,.008)+env*fres*(1.+uFlash*4.)+vec3(.45,.35,1.1)*glint+vec3(.25,.25,.5)*ring*(.35+uFlash);
float sd=length(p-uStrike.xy);c+=vec3(.4,.35,.85)*uStrike.w*(exp(-sd*.6)*.4+pow(max(dot(R,normalize(vec3(uStrike.x,6.,uStrike.y)-vW)),0.),60.)*.8);
float fog=smoothstep(30.,140.,dist);float a=1.;
if(uLight>.5){c=vec3(.42,.45,.55)+vec3(.2,.15,.45)*glint*.4-vec3(.15)*fres;a=(1.-fog)*.8;}
else c=mix(c,vec3(.02,.02,.05)*(1.+uFlash*3.),fog);
gl_FragColor=vec4(c,a);
#include <colorspace_fragment>
}`}));P.renderOrder=-2,n.add(P);const W=(e,i,m)=>{const A=new a.Mesh(new a.CircleGeometry(i,96).rotateX(Math.PI/2),new a.ShaderMaterial({uniforms:{...x,uR:{value:i},uY:{value:e},uLayer:{value:m}},transparent:!0,depthWrite:!1,side:a.DoubleSide,vertexShader:"varying vec2 vP;void main(){vP=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`${Q}uniform float uTime,uFlash,uLight,uR,uY,uLayer;uniform vec4 uF[3];varying vec2 vP;
void main(){float r=length(vP),t=uTime;
float ang=(1.8+uLayer*.5)*log(r+1.)-t*(.03+.45/(r+2.))*(1.+uLayer*.6);
vec2 q=mat2(cos(ang),-sin(ang),sin(ang),cos(ang))*vP;float a2=ang*.45;vec2 q2=mat2(cos(a2),-sin(a2),sin(a2),cos(a2))*vP;
float d=(vfbm(vec3(q*(.07+uLayer*.03),t*.03+uLayer*5.))-.5)*1.9+.5;float det=(vfbm(vec3(q2*.32,t*.05+uLayer))-.5)*1.7+.5;
float dens=smoothstep(.38,.72,d*.8+det*.35+.18*smoothstep(uR*.8,4.,r))*smoothstep(uR,uR*.55,r)*smoothstep(2.6,5.5,r);
vec3 lit=(vec3(.16,.09,.45)*exp(-r*.18)+vec3(.3,.18,.8)*exp(-pow((r-5.2)/2.2,2.)))*(.75+.25*sin(t*3.)*sin(t*1.7));
for(int i=0;i<3;i++){vec2 dd=vP-uF[i].xy;lit+=vec3(.45,.42,.85)*uF[i].w*exp(-dot(dd,dd)/(uF[i].z*uF[i].z));}
vec3 c=vec3(.01,.011,.025)*(.4+det*1.2)+lit*(.25+det*1.1)*(1.-uLayer*.3);c*=1.+uFlash*.5;
float a=dens*(.9-uLayer*.15);
if(uLight>.5){c=mix(vec3(.66,.68,.77),vec3(.34,.36,.47),det)+vec3(.2,.1,.5)*(lit.b*.15);a=dens*.93;}
gl_FragColor=vec4(c,a);
#include <colorspace_fragment>
}`}));return A.position.y=e,A.renderOrder=m,n.add(A),A},R=[W(15,70,0),W(12.2,34,1)];R[0].rotation.x=.04,R[1].rotation.x=-.05;const B=$(a,h.colors,x);B.position.copy(d),n.add(B);const M=H(a,{segments:g?1e3:2400,slots:14,light:l});n.add(M.mesh);const k=g?2200:7e3,N=new Float32Array(k*2*4),_=new Float32Array(k*2);for(let e=0;e<k;e++){const i=[t(-34,40),t(-40,20),Math.random(),t(.8,1.2)];N.set(i,e*8),N.set(i,e*8+4),_[e*2+1]=1}const G=new a.LineSegments(new a.BufferGeometry().setAttribute("position",new a.Float32BufferAttribute(new Float32Array(k*6),3)).setAttribute("seed",new a.Float32BufferAttribute(N,4)).setAttribute("aEnd",new a.Float32BufferAttribute(_,1)),new a.ShaderMaterial({uniforms:x,transparent:!0,depthWrite:!1,blending:U,vertexShader:`uniform float uTime;uniform vec3 uCam;attribute vec4 seed;attribute float aEnd;varying float vA;
void main(){float life=fract(seed.z+uTime*seed.w*1.3);vec3 vel=vec3(-.22,-1.,.05);
vec3 p=vec3(seed.x,15.-life*16.,seed.y)-vel*life*4.+vel*aEnd*.9*seed.w;
vA=smoothstep(0.,.1,life)*(1.-smoothstep(.9,1.,life))*smoothstep(70.,10.,length(uCam-p));
gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`uniform float uFlash,uLight;varying float vA;
void main(){vec3 c=vec3(.42,.46,.75)*(.6+uFlash*2.);float a=vA*.085;if(uLight>.5){c=vec3(.3,.32,.45);a=vA*.35;}
gl_FragColor=vec4(c,a);
#include <colorspace_fragment>
}`}));G.frustumCulled=!1,n.add(G);const I={big:[0,1,2],arcs:[3,4,5,6,7,8,9,10],up:[11,12]},w=new Float32Array(14).fill(-1),E=new Float32Array(14),D=[],O=(e,i)=>i==="big"?e<.05?1:e<.12?.3:e<.2?1.1:e<.26?.4:Math.max(0,.85*Math.exp(-(e-.26)*6)):(e<.15?1:.8+.2*Math.sin(e*80))*(1-e*e);let c=1.2,s=.5,S=2,L=[[0,0,8,0,0],[0,0,8,0,0]],v=null;const y=(e,i,m)=>{w[e]=0,E[e]=i,D[e]=m},F=e=>{const i=new a.Vector3(t(-1,1),t(-.7,1),t(-1,1)).normalize(),m=d.clone().addScaledVector(i,1.45);M.bolt(e,m,m.clone().addScaledVector(i.add(new a.Vector3(t(-.6,.6),t(-.6,.6),t(-.6,.6))).normalize(),t(1.2,3.4)),{gens:4,rough:.28,width:.07,forks:1}),y(e,t(.08,.22),"arc")},z=()=>{const e=I.big.reduce((V,C)=>w[V]<0?V:w[C]<0?C:w[V]>w[C]?V:C),i=t(-6,24),m=t(-32,2),A=new a.Vector3(i,t(11.5,13.5),m),r=new a.Vector3(i+t(-5,5),0,m+t(-4,4));M.bolt(e,A,r,{gens:g?5:6,rough:.16,width:.22,forks:g?3:6}),y(e,.75,"big"),v={i:e,x:r.x,z:r.z,tx:i,tz:m}},b=new a.Vector3(-n.position.x*.2,7.5,0);p.position.set(0,2.6,27),p.lookAt(b);let u=0;return f.run((e,i)=>{if(x.uTime.value=e,n.worldToLocal(x.uCam.value.copy(p.position)),e>c&&(z(),c=e+t(1.6,4.2)),e>S){const r=w[11]<0?11:12;M.bolt(r,d.clone().add(new a.Vector3(t(-.5,.5),1.4,t(-.5,.5))),new a.Vector3(d.x+t(-5,5),12.4,d.z+t(-5,3)),{gens:5,rough:.2,width:.11,forks:2}),y(r,.32,"arc"),S=e+t(.7,2.2)}e>s&&(L[Math.random()<.5?0:1].splice(0,5,t(-20,34),t(-40,10),t(5,11),0,t(.25,.5)),s=e+t(.4,1.6));for(const r of I.arcs)w[r]<0&&Math.random()<i*9&&F(r);let m=0;for(let r=0;r<14;r++){if(w[r]<0){M.level[r]=0;continue}w[r]+=i;const V=w[r]/E[r];if(V>=1){w[r]=-1,M.level[r]=0;continue}M.level[r]=O(V,D[r])*(D[r]==="arc"?t(.55,1):1),D[r]==="big"&&(m=Math.max(m,M.level[r]))}u=Math.max(m*.6,u-i*3),x.uFlash.value=u;const A=x.uF.value;v&&w[v.i]>=0?(A[0].set(v.tx,v.tz,7,M.level[v.i]*1.1),x.uStrike.value.set(v.x,v.z,0,M.level[v.i])):(A[0].w=0,x.uStrike.value.w=0),L.forEach((r,V)=>{r[3]+=i;const C=r[3]/r[4];A[V+1].set(r[0],r[1],r[2],C<1?(C<.3?.9:.5+.5*Math.sin(C*40))*(1-C)*.9:0)}),B.userData.tick(e),B.position.y=d.y+Math.sin(e*.8)*.15,p.position.set(f.pointer.x*1.2+Math.sin(e*.13)*.3+(u>.8?t(-.04,.04):0),2.6+f.pointer.y*.7,27),p.lookAt(b)}),f}
