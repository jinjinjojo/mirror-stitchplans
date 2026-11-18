import*as t from"../vendor/three/build/three.module.min.js";import{stage as ge,rnd as u,GLSL as le}from"./index.js";export const meta={name:"Galaxy",blurb:"A ringed planet, moons and a spiral galaxy",element:"space",colors:"accent"};const $=3.4,_=4.5,z=8.4,P=new t.Vector3(-.9,.3,.3).normalize(),k=`#include <colorspace_fragment>
}`,ce=`float density(float x){ if (x < 0.0 || x > 1.0) return 0.0;
  float d = smoothstep(0.0, 0.05, x) * smoothstep(1.0, 0.94, x) * (0.6 + 0.4 * sin(x * 46.0 + sin(x * 13.0) * 2.0)) * mix(0.35, 1.0, smoothstep(0.18, 0.32, x));
  return d * (1.0 - 0.94 * exp(-pow((x - 0.62) / 0.03, 2.0))) * (1.0 - 0.85 * exp(-pow((x - 0.86) / 0.01, 2.0))); }`,Me=e=>{if(e<0||e>1)return 0;const m=(f,r,d)=>{const s=Math.min(1,Math.max(0,(d-f)/(r-f)));return s*s*(3-2*s)};return m(0,.05,e)*m(1,.94,e)*(.6+.4*Math.sin(e*46+Math.sin(e*13)*2))*(.35+.65*m(.18,.32,e))*(1-.94*Math.exp(-(((e-.62)/.03)**2)))*(1-.85*Math.exp(-(((e-.86)/.01)**2)))},p=(e,m,l,f,r)=>{const d={};return new e.Color(m).getHSL(d,e.SRGBColorSpace),new e.Color().setHSL((d.h+l+1)%1,f,r,e.SRGBColorSpace)},ye="varying vec3 vO, vW, vN; void main(){ vO = position; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }",be=`uniform float uTime; uniform vec3 uL, uLo, uA, uB, uC, uD, uS, uAtm; varying vec3 vO, vW, vN;
${le.noise}
${ce}
void main(){
  vec3 p = normalize(vO);
  float lat = p.y, ang = uTime * 0.035 * sin(lat * 9.0);            // jet streams: each band drifts at its own speed
  vec2 xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz; vec3 q = vec3(xz.x, lat, xz.y);
  float turb = fbm(q * vec3(1.6, 4.0, 1.6) + vec3(0.0, 0.0, uTime * 0.01));          // slow, large waves
  float fine = snoise(q * vec3(5.0, 24.0, 5.0) + turb * 3.0);                       // eddies along the band edges
  float b = lat * 9.0 + (turb - 0.5) * 1.1 + fine * 0.13;
  vec3 col = mix(uA, uB, smoothstep(-0.6, 0.6, sin(b * 3.1416)));
  col = mix(col, uC, smoothstep(0.75, 0.98, 0.5 + 0.5 * sin(b * 1.3 + 1.3)) * 0.55);
  col = mix(col, uD, smoothstep(0.6, 1.0, 0.5 + 0.5 * sin(b * 2.3 + 4.0)) * 0.5);
  col = mix(col, uB * 0.7, smoothstep(0.8, 0.98, abs(lat)) * 0.6);
  // the storm, an oval swirl south of the equator
  vec3 sc = normalize(vec3(-0.55, -0.3, 0.78)), east = normalize(cross(vec3(0.0, 1.0, 0.0), sc)), north = cross(sc, east), e = p - sc;
  vec2 sp = vec2(dot(e, east), dot(e, north) * 1.9); float en = length(sp);
  float swirl = 0.5 + 0.5 * sin((atan(sp.y, sp.x) + en * 22.0 - uTime * 0.3) * 2.0 + turb * 4.0);
  float core = smoothstep(0.19, 0.07, en);
  col = mix(col, uB * 0.55, smoothstep(0.25, 0.19, en) * (1.0 - core) * 0.7);
  col = mix(col, mix(uS, uC, swirl * 0.7), core * 0.95);
  col *= 0.8 + 0.35 * turb + fine * 0.05;
  // light: soft terminator, the ring's shadow across the disk, atmosphere at the rim
  vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
  float ndl = dot(N, uL), day = smoothstep(-0.12, 0.35, ndl);
  float sh = 0.0; if (p.y * uLo.y < 0.0) { vec3 h = p * ${$.toFixed(2)} - uLo * (p.y * ${$.toFixed(2)} / uLo.y); sh = density((length(h.xz) - ${_.toFixed(2)}) / ${(z-_).toFixed(2)}) * 0.85; }
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
#ifdef LIGHT
  vec3 lit = col * (0.42 + 0.58 * day * (1.0 - sh)) + uAtm * rim * 0.35;
#else
  vec3 lit = col * day * day * (0.12 + 1.05 * max(ndl, 0.0)) * (1.0 - sh) + col * 0.004 + uAtm * rim * (0.03 + 0.9 * day);
#endif
  gl_FragColor = vec4(lit, 1.0);
${k}`,Se=`uniform vec3 uL, uAtm; varying vec3 vO, vW, vN;
void main(){
  vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
  float limb = pow(smoothstep(0.0, 0.42, -dot(N, V)), 2.2), day = smoothstep(-0.35, 0.6, dot(N, uL));
#ifdef LIGHT
  gl_FragColor = vec4(uAtm, limb * (0.15 + 0.4 * day));
#else
  gl_FragColor = vec4(uAtm * limb * (0.04 + 0.9 * day), 1.0);
#endif
${k}`,ue=`${ce} uniform vec3 uLo; float shadow(vec3 p){ float s = dot(p, uLo); return s > 0.0 ? 1.0 : smoothstep(${($*.92).toFixed(2)}, ${($*1.04).toFixed(2)}, length(p - uLo * s)); }`,Ae=`${ue} uniform vec3 uA, uB; uniform float uLit; varying vec3 vO;
void main(){
  float r = length(vO.xz), x = (r - ${_.toFixed(2)}) / ${(z-_).toFixed(2)}, d = density(x);
  float fine = 0.75 + 0.25 * sin(x * 260.0) * sin(x * 97.0 + 1.0);
  vec3 col = mix(uA, uB, 0.5 + 0.5 * sin(x * 31.0)) * (0.25 + 0.75 * shadow(vO)) * uLit * fine;
#ifdef LIGHT
  gl_FragColor = vec4(col, d * 0.6);
#else
  gl_FragColor = vec4(col * d * 0.42, 1.0);
#endif
${k}`,Ce=`${ue} attribute vec3 aRnd; uniform float uTime, uScale, uLit; uniform vec3 uA, uB; varying vec3 vCol;
void main(){
  float r = position.x, a = position.y + uTime * 1.6 * pow(r / ${_.toFixed(2)}, -1.5) * 0.12;   // inner particles orbit faster
  vec3 p = vec3(cos(a) * r, position.z, sin(a) * r);
  vCol = mix(uA, uB, aRnd.x) * (0.15 + 0.5 * aRnd.y * aRnd.y) * (0.15 + 0.85 * shadow(p)) * uLit;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = max(1.0, (0.025 + 0.035 * aRnd.z) * uScale / -mv.z);
  gl_Position = projectionMatrix * mv;
}`,Y=`varying vec3 vCol;
void main(){ float r = length(gl_PointCoord - 0.5), a = smoothstep(0.5, 0.1, r);
#ifdef LIGHT
  gl_FragColor = vec4(vCol, a * 0.5);
#else
  gl_FragColor = vec4(vCol * a, 1.0);
#endif
${k}`,de=`attribute vec3 aCol; attribute vec2 aTw; uniform float uTime, uScale, uSize; varying vec3 vCol;
void main(){
  vCol = aCol * (0.7 + 0.3 * sin(uTime * aTw.x + aTw.y));
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = max(1.0, uSize * uScale / -mv.z * (0.6 + 0.8 * fract(aTw.y * 7.31)));
  gl_Position = projectionMatrix * mv;
}`,Le=`uniform float uTime, uLite; uniform vec3 uA, uB; varying vec2 vUv;
${le.noise}
void main(){
  vec2 p = vUv * vec2(3.2, 2.0);
  float w = uLite > 0.5 ? 0.5 : fbm(vec3(p * 0.8, uTime * 0.01));
  float n = uLite > 0.5 ? 0.5 + 0.4 * snoise(vec3(p * 0.9, 3.0)) : fbm(vec3(p + w * 1.6, uTime * 0.015 + 3.0));
  float band = exp(-pow((vUv.y - 0.85 + vUv.x * 0.75) * 2.6, 2.0)) * smoothstep(0.2, 0.75, vUv.x);
  vec3 col = mix(uA, uB, smoothstep(0.35, 0.7, w)) * pow(n, 2.5) * band;
#ifdef LIGHT
  gl_FragColor = vec4(col / max(max(col.r, max(col.g, col.b)), 0.001), min(0.18, pow(n, 2.5) * band * 0.3));
#else
  gl_FragColor = vec4(col * 0.12, 1.0);
#endif
${k}`,Be=`uniform vec4 uAB; uniform float uW; varying vec2 vUv;
void main(){ vUv = uv; vec2 a = uAB.xy, b = uAB.zw, d = normalize(b - a), n = vec2(-d.y, d.x);
  vec2 p = mix(b, a, uv.x) + n * (uv.y - 0.5) * uW * (0.3 + 0.7 * uv.x); gl_Position = vec4(p, 0.0, 1.0); }`,ze=`uniform float uK; uniform vec3 uC; varying vec2 vUv;
void main(){ float a = pow(vUv.x, 2.5) * (1.0 - pow(abs(vUv.y - 0.5) * 2.0, 2.0)) * uK;
#ifdef LIGHT
  gl_FragColor = vec4(uC, a * 0.7);
#else
  gl_FragColor = vec4(uC * a * 1.6, 1.0);
#endif
${k}`;function me(e,m,{light:l=!1,lite:f=!1}={}){const r=m.accent,d=l?{LIGHT:1}:{},s={uTime:{value:0},uL:{value:P.clone()},uLo:{value:P.clone()},uA:{value:p(e,r,0,.55,l?.5:.52)},uB:{value:p(e,r,-.06,.45,l?.32:.3)},uC:{value:p(e,r,.04,.35,.82)},uD:{value:p(e,r,.12,.5,.45)},uS:{value:p(e,r,.09,.55,.66)},uAtm:{value:p(e,r,.03,.9,l?.45:.7)}},v=(b,S={})=>new e.ShaderMaterial({vertexShader:ye,fragmentShader:b,uniforms:s,defines:d,...S}),n=new e.Group;n.rotation.set(.42,0,-.32);const g=new e.Mesh(new e.SphereGeometry($,f?64:96,f?40:64),v(be));n.add(g);const M=new e.Mesh(new e.SphereGeometry($*1.13,64,40),v(Se,{side:e.BackSide,transparent:!0,depthWrite:!1,blending:l?e.NormalBlending:e.AdditiveBlending}));n.add(M);const w={uLo:s.uLo,uTime:s.uTime,uScale:{value:600},uLit:{value:1},uA:{value:l?p(e,r,.02,.3,.3):p(e,r,.02,.18,.82)},uB:{value:l?p(e,r,-.08,.4,.42):p(e,r,-.06,.3,.6)}},U=l?e.NormalBlending:e.AdditiveBlending,y=new e.Mesh(new e.RingGeometry(_,z,160,1).rotateX(-Math.PI/2),new e.ShaderMaterial({vertexShader:"varying vec3 vO; void main(){ vO = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:Ae,uniforms:w,defines:d,transparent:!0,depthWrite:!1,side:e.DoubleSide,blending:U}));n.add(y);const G=f?9e3:28e3,C=new Float32Array(G*3),W=new Float32Array(G*3);for(let b=0;b<G;){const S=Math.random();Math.random()>Me(S)||(C.set([_+S*(z-_),Math.random()*Math.PI*2,(Math.random()-.5)*.06],b*3),W.set([Math.random(),Math.random(),Math.random()],b*3),b++)}const B=new e.BufferGeometry;B.setAttribute("position",new e.BufferAttribute(C,3)),B.setAttribute("aRnd",new e.BufferAttribute(W,3)),B.boundingBox=new e.Box3(new e.Vector3(-z,-.1,-z),new e.Vector3(z,.1,z)),B.boundingSphere=new e.Sphere(new e.Vector3,z);const V=new e.Points(B,new e.ShaderMaterial({vertexShader:Ce,fragmentShader:Y,uniforms:w,defines:d,transparent:!0,depthWrite:!1,blending:U}));V.frustumCulled=!1,n.add(V);const L=new e.Matrix4,I=new e.Quaternion;return{group:n,planet:g,tick:(b,S=P,N=900)=>{s.uTime.value=b,g.rotation.y=b*.05,s.uL.value.copy(S),g.updateWorldMatrix(!0,!1),s.uLo.value.copy(S).applyQuaternion(I.setFromRotationMatrix(L.extractRotation(g.matrixWorld)).invert()).normalize(),w.uLit.value=.55+.45*Math.abs(s.uLo.value.y),w.uScale.value=N/(2*Math.tan(t.MathUtils.degToRad(20)))},U:s}}function fe(e,m,l,f){let r=f;const d=()=>(r=r*16807%2147483647)/2147483647,s=new e.SphereGeometry(m,72,48),v=s.attributes.position,n=new e.Vector3,g=Array.from({length:l},()=>[new e.Vector3(d()*2-1,d()*2-1,d()*2-1).normalize(),.07+Math.pow(d(),3)*.45,.4+d()*.6]);for(let M=0;M<v.count;M++){n.fromBufferAttribute(v,M).normalize();let w=0;for(const[U,y,G]of g){const C=Math.acos(Math.min(1,n.dot(U)))/y;C<1?w+=(C*C-1)*.2*y*G+.05*y:C<1.6&&(w+=.05*y*Math.exp(-((C-1)**2)*18))}v.setXYZ(M,n.x*m*(1+w),n.y*m*(1+w),n.z*m*(1+w))}return s.computeVertexNormals(),s}export const models={planet:(e,m,l={})=>{const f=me(e,m,l);return f.group.userData.tick=r=>f.tick(r,P,420),f.tick(0,P,420),f.group},moon:(e,m)=>new e.Mesh(fe(e,1,40,7),new e.MeshStandardMaterial({color:new e.Color(m.ink??14540253).lerp(new e.Color(10066329),.5),roughness:.95}))};export function start(e,m){const l=ge(t,e,m,{fov:40,fog:null,lights:!1,bloom:{strength:.6,radius:.3,threshold:.6}}),{rig:f,camera:r,scene:d,lite:s,light:v}=l,n=m.colors,g=v?{LIGHT:1}:{},M=v?t.NormalBlending:t.AdditiveBlending;v||(d.background=new t.Color(n.void));const w=new t.DirectionalLight(16777215,2.6),U=new t.AmbientLight(16777215,v?.9:.05);d.add(w,U);const y=me(t,n,{light:v,lite:s});f.add(y.group);const G=()=>l.renderer.domElement.height/(2*Math.tan(t.MathUtils.degToRad(r.fov/2))),C=a=>new t.MeshStandardMaterial({color:a,roughness:.95,metalness:0}),W=[[.62,12.5,.11,.18,p(t,n.accent,0,.08,.72),11],[.5,15.5,-.07,-.12,new t.Color(13154468),23],[.32,10.2,.16,.3,p(t,n.accent,.5,.15,.78),37]].slice(0,s?2:3).map(([a,c,o,h,i,A])=>{const F=new t.Mesh(fe(t,a,36,A),C(i));return f.add(F),{m:F,d:c,sp:o,inc:h,a:u(0,6.3)}}),B=new t.IcosahedronGeometry(1,1),V=B.attributes.position,L=new t.Vector3;for(let a=0;a<V.count;a++){L.fromBufferAttribute(V,a);const c=.75+.35*Math.sin(L.x*5.1+L.y*3.7)*Math.cos(L.z*4.3+L.x*2.1);V.setXYZ(a,L.x*c,L.y*c*.8,L.z*c)}B.computeVertexNormals();const I=s?70:180,O=new t.InstancedMesh(B,new t.MeshStandardMaterial({roughness:1,flatShading:!0}),I),b=Array.from({length:I},(a,c)=>(O.setColorAt(c,new t.Color(v?12103846:7235166).lerp(p(t,n.accent,0,.35,.45),Math.random()*.3).multiplyScalar(.55+Math.random()*.5)),{r:u(10.5,13.5),a:u(0,6.3),y:(Math.random()-.5)*.7,s:.04+Math.pow(Math.random(),4)*.2,sp:u(.012,.03),rx:u(0,6),ry:u(0,6),spin:u(.2,.9)})),S=new t.Group;S.rotation.set(.3,0,-.18),S.add(O),f.add(S);const N=new t.Object3D,H=s?1800:4500,Q=new Float32Array(H*3),Z=new Float32Array(H*3),J=new Float32Array(H*2),ee=[10335487,13293567,16777215,16774378,16765601,16754795,n.accent].map(a=>new t.Color(a));for(let a=0;a<H;a++){const c=u(160,260),o=u(0,Math.PI*2),h=Math.acos(u(-1,1));Q.set([c*Math.sin(h)*Math.cos(o),c*Math.sin(h)*Math.sin(o),c*Math.cos(h)],a*3);const i=ee[Math.floor(Math.random()*ee.length)].clone().multiplyScalar(v?.5:.35+Math.pow(Math.random(),3)*1.4);v&&i.set(n.ink).multiplyScalar(.8),Z.set([i.r,i.g,i.b],a*3),J.set([u(.6,3),u(0,60)],a*2)}const T={uTime:y.U.uTime,uScale:{value:600},uSize:{value:v?.5:.75}},E=new t.BufferGeometry;E.setAttribute("position",new t.BufferAttribute(Q,3)),E.setAttribute("aCol",new t.BufferAttribute(Z,3)),E.setAttribute("aTw",new t.BufferAttribute(J,2));const ve=new t.ShaderMaterial({vertexShader:de,fragmentShader:Y,uniforms:T,defines:g,transparent:!0,depthWrite:!1,blending:M}),X=new t.Points(E,ve);X.frustumCulled=!1,d.add(X);const D=s?7e3:26e3,te=new Float32Array(D*3),oe=new Float32Array(D*3),ae=new Float32Array(D*2),he=new t.Color(16769720),pe=p(t,n.accent,.08,.6,.7),xe=new t.Color(10467583),we=new t.Color(16743096),j=()=>(Math.random()+Math.random()+Math.random()-1.5)/1.5;for(let a=0;a<D;a++){let c,o,h,i;if(Math.random()<.16){const A=Math.abs(j())*3.5,F=u(0,6.3);c=Math.cos(F)*A,h=Math.sin(F)*A,o=j()*.9*(1-A/5),i=he.clone().multiplyScalar(.1+Math.random()*.2)}else{const A=2+Math.pow(Math.random(),.9)*26,F=Math.floor(Math.random()*3)*2.094+Math.log(A)*2.2+j()*(.22+4/A);c=Math.cos(F)*A,h=Math.sin(F)*A,o=j()*.4,i=(Math.random()<.05?we:pe.clone().lerp(xe,Math.random())).clone().multiplyScalar((.12+Math.random()*.4)*(1-A/32))}v&&i.set(n.ink).lerp(new t.Color(n.accent),.4).multiplyScalar(.9),te.set([c,o,h],a*3),oe.set([i.r,i.g,i.b],a*3),ae.set([u(.5,2),u(0,60)],a*2)}const q=new t.BufferGeometry;q.setAttribute("position",new t.BufferAttribute(te,3)),q.setAttribute("aCol",new t.BufferAttribute(oe,3)),q.setAttribute("aTw",new t.BufferAttribute(ae,2));const R=new t.Points(q,new t.ShaderMaterial({vertexShader:de,fragmentShader:Y,uniforms:{...T,uSize:{value:v?.3:.36}},defines:g,transparent:!0,depthWrite:!1,blending:M}));R.position.set(48,40,-170),R.rotation.set(1.1,.2,-.5),R.frustumCulled=!1,d.add(R);const ne=(a,c,o="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }",h=-10)=>{const i=new t.Mesh(new t.PlaneGeometry(2,2),new t.ShaderMaterial({vertexShader:o,fragmentShader:a,uniforms:c,defines:g,transparent:!0,depthWrite:!1,depthTest:!1,blending:M}));return i.frustumCulled=!1,i.renderOrder=h,d.add(i),i};ne(Le,{uTime:y.U.uTime,uLite:{value:s?1:0},uA:{value:p(t,n.accent,.05,.8,.5)},uB:{value:p(t,n.accent,.42,.7,.5)}});const K={uAB:{value:new t.Vector4},uW:{value:.006},uK:{value:0},uC:{value:v?new t.Color(n.ink):new t.Color(15398143)}};ne(ze,K,Be,5);let re=3,x=null;const ie=()=>{const a=Math.min(1.7,Math.max(1,1.15/r.aspect));r.position.set(0,2.6,28*a),r.lookAt(0,(a-1)*5.6,0),r.updateMatrixWorld()};ie();const se=new t.Vector3;return l.run((a,c)=>{ie(),se.copy(P),w.position.copy(P).multiplyScalar(50),y.tick(a,se,l.renderer.domElement.height),T.uScale.value=G();for(const o of W)o.a+=o.sp*c,o.m.position.set(Math.cos(o.a)*o.d,Math.sin(o.a)*o.d*o.inc,Math.sin(o.a)*o.d),o.m.rotation.y=a*.05;if(b.forEach((o,h)=>{o.a+=o.sp*c,N.position.set(Math.cos(o.a)*o.r,o.y,Math.sin(o.a)*o.r),N.rotation.set(o.rx+a*o.spin*.3,o.ry+a*o.spin*.2,0),N.scale.set(o.s,o.s*.8,o.s*1.1),N.updateMatrix(),O.setMatrixAt(h,N.matrix)}),O.instanceMatrix.needsUpdate=!0,R.rotation.y=.2+a*.004,X.rotation.y=a*.003,!x&&a>re&&c>0){const o=u(-.6,.9),h=u(.35,.9),i=u(-2.7,-2.2);x={t:a,x:o,y:h,dx:Math.cos(i),dy:Math.sin(i),len:u(.25,.45),dur:u(.6,1)}}if(x){const o=(a-x.t)/x.dur;if(o>=1)x=null,K.uK.value=0,re=a+u(4,9);else{const h=x.x+x.dx*o*.9,i=x.y+x.dy*o*.9;K.uAB.value.set(h,i,h-x.dx*x.len,i-x.dy*x.len),K.uK.value=Math.sin(o*Math.PI)}}}),l}
