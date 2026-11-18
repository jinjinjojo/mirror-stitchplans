import*as n from"../vendor/three/build/three.module.min.js";import{stage as T,glowTexture as ee,GLSL as te}from"./index.js";export const meta={name:"Prism",blurb:"A glass prism splitting white light into your accent",element:"light",colors:"accent"};const f=2.1,Z=.66,J=(e,d,r)=>[e[0]+(d[0]-e[0])*r,e[1]+(d[1]-e[1])*r],Q=[0,f],oe=[-.866*f,-.5*f],ae=[.866*f,-.5*f],h=J(Q,oe,.56),g=[.42,.53,.64].map(e=>J(Q,ae,e)),j=[.34,.01,-.33],X=.27,q=[0,.165,.44],ne=7.5;function ie(e,d,r){const l={};return new e.Color(d.accent).getHSL(l,e.SRGBColorSpace),{h:l.h,C:q.map(u=>new e.Color().setHSL((l.h+u)%1,1,r?.42:.6,e.SRGBColorSpace))}}const K=`varying vec3 vW, vN, vO; varying vec2 vUv;
void main(){ vO = position; vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,U=`uniform float uTime, uFlash; uniform vec3 uH;
vec3 spec3(float v){ float h = v > 0.5 ? mix(uH.y, uH.x, v * 2.0 - 1.0) : mix(uH.z, uH.y, v * 2.0);
  vec3 c = clamp(abs(mod(fract(h) * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
#ifdef LIGHT
  return pow(c * 0.72, vec3(2.2));
#else
  return pow(mix(vec3(1.0), c, 0.82), vec3(2.2));
#endif
}`,N=`#include <colorspace_fragment>
}`,re=`${U} uniform float uBack; uniform vec3 uC0, uC1, uC2, uInk, uIn, uOut;
varying vec3 vW, vN, vO;
vec3 rainbow(float x){ return 0.5 + 0.5 * cos(6.2832 * (x + vec3(0.0, 0.33, 0.67))); }
void main(){
  vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
  float ndv = abs(dot(N, V)), F = pow(1.0 - ndv, 2.2);
  float a = ${(.5*f).toFixed(4)} + vO.y, b = ${(.5*f).toFixed(4)} - dot(vO.xy, vec2(0.8660, 0.5)), c = ${(.5*f).toFixed(4)} - dot(vO.xy, vec2(-0.8660, 0.5)), e = ${Z.toFixed(4)} - abs(vO.z);
  float ed = min(max(min(a, b), min(c, e)), min(max(a, b), max(c, e)));   // second-nearest face = distance to an edge
  float edge = 1.0 - smoothstep(0.014, 0.014 + fwidth(ed) * 1.5, ed), halo = exp(-ed * 12.0);
  vec3 pa = vO - uIn, ba = uOut - uIn; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); float di = length(pa - ba * h);
  float inner = exp(-di * di * 1.6);
  vec3 innerC = mix(vec3(1.0), spec3(clamp(0.5 + (vO.y - uOut.y) * 0.8, 0.0, 1.0)), smoothstep(0.1, 0.9, h));
  vec3 irid = rainbow(F * 1.3 + dot(N, vec3(0.25, 0.6, 0.3)) * 0.7 + vO.y * 0.12 + uTime * 0.04);
  vec3 Rf = reflect(-V, N);
  float env = smoothstep(-0.3, 0.9, Rf.y) * 0.1 + exp(-pow((Rf.x - 0.45) * 5.0, 2.0)) * smoothstep(-0.2, 0.4, Rf.y) * 0.55
            + pow(max(dot(Rf, normalize(vec3(-0.4, 0.75, 0.5))), 0.0), 40.0) * 0.8;
  float grad = 0.5 + 0.5 * (vO.y / ${f.toFixed(3)});
  vec2 xo = vO.xy - uOut.xy, xi = vO.xy - uIn.xy;
  vec3 glowC = spec3(clamp(0.5 + (vO.y - uOut.y) * 1.3, 0.0, 1.0)) * exp(-dot(xo, xo) * 1.8) * (0.14 + uFlash * 0.3) + vec3(0.12) * exp(-dot(xi, xi) * 3.0);
#ifdef LIGHT
  float al = 0.1 + F * 0.3 + inner * 0.2 + halo * 0.1 + edge * 0.9 * uBack;
  vec3 col = mix(vec3(1.0), uC1, 0.1 + grad * 0.08);
  col = mix(col, irid * 0.5 + 0.35, F * 0.5);
  col = mix(col, innerC * 0.85, inner * 0.5);
  col = mix(col, uInk, clamp(edge * uBack + halo * 0.25, 0.0, 1.0));
  gl_FragColor = vec4(col, al);
#else
  vec3 col = irid * F * 0.3 + vec3(0.9, 0.95, 1.0) * env * (0.25 + 0.75 * uBack) + innerC * inner * 0.1 + uC1 * (0.012 + grad * 0.02) + glowC;
  col += mix(vec3(1.0), irid, 0.35) * (edge * (0.25 + 0.6 * uBack) * (1.0 + uFlash * 1.5) + halo * (0.05 + uFlash * 0.25));
  float al = 0.2 + F * 0.25;
  gl_FragColor = vec4(col, al);
#endif
${N}`,le=`${U} varying vec2 vUv; varying vec3 vW;
void main(){
  float u = vUv.x, v = clamp((vUv.y - 0.5) / max(u, 0.001) + 0.5, 0.0, 1.0);
  vec3 col = mix(vec3(1.0), spec3(v) * 1.3, smoothstep(0.0, 0.55, u));
  float I = (0.5 + 0.15 * sin(u * 30.0 - uTime * 6.0)) * mix(1.0, smoothstep(0.0, 0.25, v) * smoothstep(1.0, 0.75, v), u) * smoothstep(0.0, 0.45, u) * (1.0 + uFlash);
#ifdef LIGHT
  gl_FragColor = vec4(col * 0.8, I * 0.7);
#else
  gl_FragColor = vec4(col * I * 0.6, 1.0);
#endif
${N}`,ue=`uniform float uLen, uR0, uR1; varying vec3 vW, vN; varying float vU;
void main(){ vU = uv.y; vec3 p = position; p.x *= uLen; p.yz *= mix(uR0, uR1, uv.y);
  vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * vec3(0.0, normal.yz));
  gl_Position = projectionMatrix * viewMatrix * w; }`,ce=`${U} uniform float uSurge, uSeed, uPulses, uGain; uniform vec2 uFade; uniform vec3 uColor;
varying vec3 vW, vN; varying float vU;
void main(){
  vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
  float ndv = abs(dot(N, V)), core = pow(ndv, 9.0), soft = pow(ndv, 2.0);
  float along = smoothstep(0.0, uFade.x, vU) * (1.0 - smoothstep(uFade.y, 1.0, vU));
  float p = fract(vU * uPulses - uTime * 0.5 + uSeed);
  float pulse = exp(-pow((p - 0.5) * 16.0, 2.0)) * 1.4;
  float surge = uSurge > -0.5 ? exp(-pow((vU - uSurge) * 16.0, 2.0)) * 1.8 : 0.0;
  float flick = 0.92 + 0.08 * sin(vU * 140.0 - uTime * 11.0 + uSeed * 9.0);
  float I = (soft * 0.22 + core * 0.6) * along * flick * (1.0 + pulse + surge) * uGain;
#ifdef LIGHT
  gl_FragColor = vec4(uColor, clamp(I * 0.9, 0.0, 0.92));
#else
  gl_FragColor = vec4(uColor * I + vec3(core * along * 0.14 * uGain * (1.0 + surge)), 1.0);
#endif
${N}`,se=`${U} uniform float uSurge; varying vec2 vUv; varying vec3 vW;
void main(){
  float u = vUv.x, v = vUv.y;
  float rays = 0.65 + 0.35 * sin(v * 47.0 + sin(v * 9.0 + uTime * 0.3) * 2.0) * sin(v * 23.0 - uTime * 0.21);
  float surge = uSurge > -0.5 ? exp(-pow((u - uSurge) * 10.0, 2.0)) * 1.5 : 0.0;
  float I = smoothstep(0.0, 0.2, v) * smoothstep(1.0, 0.8, v) * smoothstep(0.0, 0.05, u) * pow(1.0 - u, 2.6) * rays * (1.0 + surge);
#ifdef LIGHT
  gl_FragColor = vec4(spec3(v), I * 0.3);
#else
  gl_FragColor = vec4(spec3(v) * I * 0.13, 1.0);
#endif
${N}`;function Y(e,d,{light:r=!1,inLen:l=6,outLen:u=7}={}){const{h:w,C:y}=ie(e,d,r),M=new e.Color(d.ink??1844258),s={uTime:{value:0},uFlash:{value:0},uH:{value:new e.Vector3(w+q[0],w+q[1],w+q[2])},uC0:{value:y[0]},uC1:{value:y[1]},uC2:{value:y[2]},uInk:{value:M}},E=r?{LIGHT:1}:{},I=(o,a={},t=K,i={})=>new e.ShaderMaterial({vertexShader:t,fragmentShader:o,uniforms:{...s,...a},transparent:!0,depthWrite:!1,blending:r?e.NormalBlending:e.AdditiveBlending,defines:E,...i}),O=new e.Group,v=new e.Group;O.add(v);const x=(o,a,t)=>(a.renderOrder=t,a.frustumCulled=!1,o.add(a),a),k=new e.Vector3(h[0],h[1],0),R=new e.Vector3(...g[1],0),z=new e.CylinderGeometry(f,f,2*Z,3,1,!1,Math.PI).rotateX(Math.PI/2).toNonIndexed();z.computeVertexNormals();for(const[o,a,t]of[[e.BackSide,.35,3],[e.FrontSide,1,5]])x(v,new e.Mesh(z,I(re,{uBack:{value:a},uIn:{value:k},uOut:{value:R}},K,{side:o,blending:e.NormalBlending,premultipliedAlpha:!r})),t);const C=new e.BufferGeometry;C.setAttribute("position",new e.Float32BufferAttribute([h[0],h[1],0,...g[2],0,...g[0],0],3)),C.setAttribute("uv",new e.Float32BufferAttribute([0,.5,1,0,1,1],2)),C.setAttribute("normal",new e.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3)),x(v,new e.Mesh(C,I(le,{},K,{side:e.DoubleSide})),4);const $=new e.CylinderGeometry(1,1,1,18,1,!0).translate(0,.5,0).rotateZ(-Math.PI/2),P={value:-1},A={value:-1},_=(o,a,t,i,m,S,L,p=1)=>new e.Mesh($,I(ce,{uColor:{value:o},uLen:{value:a},uR0:{value:t},uR1:{value:i},uFade:{value:new e.Vector2(...m)},uSeed:{value:S},uPulses:{value:a/7},uGain:{value:p},uSurge:L},ue)),B=x(O,_(r?M.clone():new e.Color(1,.98,.95),l,.075,.09,[.95,.999],.3,P,r?.75:.85),2);B.rotation.z=X;const c=g.map((o,a)=>{const t=x(v,_(y[a],u,.09,Math.min(.85,u*.018),[.004,.2],a*.37,A,1.1),2);return t.position.set(o[0],o[1],0),t}),F=new e.BufferGeometry,W=(o,a)=>[o[0]+Math.cos(a)*u,o[1]+Math.sin(a)*u,0];F.setAttribute("position",new e.Float32BufferAttribute([...g[2],0,...W(g[2],j[2]),...g[0],0,...W(g[0],j[0])],3)),F.setAttribute("uv",new e.Float32BufferAttribute([0,0,1,0,0,1,1,1],2)),F.setAttribute("normal",new e.Float32BufferAttribute([0,0,1,0,0,1,0,0,1,0,0,1],3)),F.setIndex([0,1,2,2,1,3]),x(v,new e.Mesh(F,I(se,{uSurge:A},K,{side:e.DoubleSide})),1);const H=[];if(!r){const o=ee(e),a=(t,i,m,S,L)=>{const p=x(v,new e.Sprite(new e.SpriteMaterial({map:o,color:t,blending:e.AdditiveBlending,depthWrite:!1,transparent:!0})),6);p.scale.set(i,m,1),p.position.set(S,L,0),H.push(p)};a(new e.Color(.4,.4,.4),1,1,h[0],h[1]),a(new e.Color(.22,.27,.34),4.5,.09,h[0],h[1]),g.forEach((t,i)=>a(y[i].clone().multiplyScalar(.55),.8,.8,t[0],t[1]))}let b=0;const G=new e.Vector3,D=new e.Vector3(Math.cos(X),Math.sin(X),0);return{group:O,prism:v,tick:(o,a,t={x:0,y:0})=>{s.uTime.value=o,v.rotation.y=.26*Math.sin(o*.21)+t.x*.18,v.rotation.x=.05*Math.sin(o*.27)-t.y*.08,v.position.y=.1*Math.sin(o*.5),v.updateMatrix(),G.set(h[0],h[1],0).applyMatrix4(v.matrix),B.position.copy(G).addScaledVector(D,-l),c.forEach((L,p)=>{L.rotation.z=j[p]*(1+.04*Math.sin(o*.6+p))});const i=o%ne,m=1.4,S=1.8;P.value=i<m?i/m:-1,b=Math.max(b-a*2.2,i>=m&&i<m+.12?1:0),A.value=i>m&&i<m+S?(i-m)/S*Math.min(1,24/u):-1,s.uFlash.value=b*b,H.forEach((L,p)=>L.material.opacity=(p<2?.85:.6)+.15*Math.sin(o*3+p)+b*.6)},C:y,h:w,U:s,inBeam:B,hit:G,outs:c}}export const models={prism:(e,d,r={})=>{const l=Y(e,d,{light:!!r.light,inLen:5,outLen:6});return l.group.userData.tick=(u,w)=>l.tick(u,w),l.tick(0,0),l.group}};const ve=`${U} attribute vec3 aRnd; uniform float uScale; uniform vec3 uA, uB, uLo, uSize, uC0, uC1, uC2; uniform mat4 uPI; uniform vec3 uO[3], uD[3];
varying vec3 vCol;
void main(){
  vec3 p = position;
  p += vec3(uTime * 0.12 + sin(uTime * 0.13 + aRnd.x * 30.0) * 0.6, uTime * 0.04 * (aRnd.z + 0.3) + sin(uTime * 0.17 + aRnd.y * 40.0) * 0.35, cos(uTime * 0.11 + aRnd.z * 20.0) * 0.5);
  p = uLo + mod(p - uLo, uSize);
  vec3 pa = p - uA, ba = uB - uA; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); float d = length(pa - ba * h);
  vec3 lit = vec3(1.0) * exp(-d * d * 10.0) * smoothstep(0.2, 0.7, h);
  vec3 q = (uPI * vec4(p, 1.0)).xyz;
  vec3 C[3]; C[0] = uC0; C[1] = uC1; C[2] = uC2;
  for (int i = 0; i < 3; i++) { vec3 po = q - uO[i]; float s = dot(po, uD[i]); float w = 0.2 + max(s, 0.0) * 0.02; float di = length(po - uD[i] * max(s, 0.0));
    lit += C[i] * 1.3 * exp(-di * di / (w * w)) * step(0.0, s) * exp(-s * 0.03); }
  vec3 e = q - uO[1]; float ang = atan(e.y, e.x);
  if (e.x > 0.0) lit += spec3(clamp(ang / 0.68 + 0.5, 0.0, 1.0)) * 0.5 * smoothstep(0.4, 0.3, abs(ang)) * exp(-e.z * e.z * 2.0) * exp(-e.x * 0.04);
  float tw = pow(0.5 + 0.5 * sin(uTime * (1.2 + aRnd.x * 2.5) + aRnd.y * 60.0), 6.0);
  float L = min(length(lit), 1.6);
  vCol = lit * (0.45 + 2.2 * tw) + vec3(0.03);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = max(1.3, (0.03 + 0.085 * L * (0.35 + tw)) * uScale / -mv.z);
  gl_Position = projectionMatrix * mv;
}`,me=`varying vec3 vCol;
void main(){ float r = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, r);
#ifdef LIGHT
  gl_FragColor = vec4(vCol * 0.7, a * min(1.0, length(vCol) * 1.2));
#else
  gl_FragColor = vec4(vCol * a * a, 1.0);
#endif
${N}`,de=`${U} uniform float uLite; uniform vec3 uC0, uC1, uC2, uW, uE; uniform vec4 uL[4]; uniform vec2 uFan, uG; varying vec2 vUv;
${te.noise}
float seg(vec2 p, vec4 l, out float h){ vec2 pa = p - l.xy, ba = l.zw - l.xy; h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
float caustic(vec2 uv){   // the classic tileable water caustic
  vec2 p = mod(uv * 6.2832, 6.2832) - 250.0, i = p; float c = 1.0;
  for (int n = 0; n < 4; n++) { float t = uTime * 0.3 * (1.0 - 3.5 / float(n + 1)); i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / 0.005), p.y / (cos(i.y + t) / 0.005))); }
  c = 1.17 - pow(c / 4.0, 1.4); return pow(abs(c), 8.0); }
void main(){
  vec2 p = (vUv * 2.0 - 1.0) * vec2(uE.z, 1.0);            // screen space, 1 = half the height
  vec3 C[3]; C[0] = uC0; C[1] = uC1; C[2] = uC2;
  float h, d = seg(p, uL[0], h);
  vec3 col = uW * exp(-d * d * 70.0) * h * h * 0.05;
  for (int i = 0; i < 3; i++) { d = seg(p, uL[i + 1], h); float w = 0.03 + h * 0.22; col += C[i] * exp(-d * d / (w * w)) * pow(1.0 - h, 1.6) * 0.22; }
  vec2 e = p - uE.xy; float v = (atan(e.y, e.x) - uFan.x) / (uFan.y - uFan.x);
  float fan = smoothstep(-0.1, 0.25, v) * smoothstep(1.1, 0.75, v) * smoothstep(0.0, 0.15, e.x) * exp(-length(e) * 0.7);
  float k = uLite > 0.5 || fan < 0.004 ? 0.3 : caustic(e * vec2(0.5, 0.9) + vec2(-uTime * 0.02, 0.0));
  col += spec3(clamp(v, 0.0, 1.0)) * fan * (0.05 + k * 0.16);
  float haze = uLite > 0.5 || max(col.r, max(col.g, col.b)) < 0.0015 ? 0.55 : fbm(vec3(p * 1.5 + vec2(-uTime * 0.05, 0.0), uTime * 0.05));
  col *= 0.25 + 1.5 * haze * haze;
  vec2 g = p - uG; col += mix(uC1, uC0, smoothstep(-0.6, 0.6, g.y)) * exp(-dot(g, g) * 1.3) * (0.006 + 0.012 * haze);
#ifdef LIGHT
  float mx = max(col.r, max(col.g, col.b)); gl_FragColor = vec4(col / max(mx, 0.001), clamp(mx * 3.0, 0.0, 0.3));
#else
  gl_FragColor = vec4(col, 1.0);
#endif
${N}`;export function start(e,d){const r=T(n,e,d,{fov:36,fog:null,lights:!1,bloom:{strength:.55,radius:.2,threshold:.55}}),{rig:l,camera:u,scene:w,lite:y,light:M}=r;M||(w.background=new n.Color(d.colors.void));const s=Y(n,d.colors,{light:M,inLen:16,outLen:46});l.add(s.group);const{U:E}=s,I=M?n.NormalBlending:n.AdditiveBlending,O=M?{LIGHT:1}:{},v=new n.Matrix4,x=new n.Vector3,k=new n.Vector3,R=y?1800:6e3,z=new n.Vector3(-14,-4.5,-7),C=new n.Vector3(40,10,14),$=new Float32Array(R*3),P=new Float32Array(R*3);for(let t=0;t<R;t++){const i=Math.random()<.65?(Math.random()+Math.random()+Math.random()-1.5)*1.6:z.z+Math.random()*C.z;$.set([z.x+Math.random()*C.x,z.y+Math.random()*C.y,i],t*3),P.set([Math.random(),Math.random(),Math.random()],t*3)}const A=new n.BufferGeometry;A.setAttribute("position",new n.BufferAttribute($,3)),A.setAttribute("aRnd",new n.BufferAttribute(P,3));const _={...E,uPI:{value:v},uA:{value:x},uB:{value:k},uScale:{value:500},uLo:{value:z},uSize:{value:C},uO:{value:g.map(t=>new n.Vector3(t[0],t[1],0))},uD:{value:j.map(t=>new n.Vector3(Math.cos(t),Math.sin(t),0))}},B=new n.Points(A,new n.ShaderMaterial({vertexShader:ve,fragmentShader:me,uniforms:_,transparent:!0,depthWrite:!1,blending:I,defines:O}));B.frustumCulled=!1,B.renderOrder=7,l.add(B);const c=[0,1,2,3].map(()=>new n.Vector4),F=new n.Vector3,W=new n.Vector2,H=new n.Vector2,b=new n.Mesh(new n.PlaneGeometry(2,2),new n.ShaderMaterial({vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }",fragmentShader:de,uniforms:{...E,uLite:{value:y?1:0},uW:{value:new n.Color(M?0:16777215)},uL:{value:c},uE:{value:F},uG:{value:W},uFan:{value:H}},transparent:!0,depthWrite:!1,depthTest:!1,blending:I,defines:O}));b.frustumCulled=!1,b.renderOrder=-30,w.add(b),u.position.set(0,1,15.5),u.lookAt(l.position.x*.42,-.3,0),u.updateMatrixWorld();const G=new n.Vector3,D=new n.Vector3,V=(t,i)=>(t.applyMatrix4(l.matrixWorld).project(u),i.set(t.x*u.aspect,t.y),i),o=new n.Vector2,a=new n.Vector2;return r.run((t,i)=>{s.tick(t,i,r.pointer),_.uScale.value=r.renderer.domElement.height/(2*Math.tan(n.MathUtils.degToRad(u.fov/2))),v.copy(s.prism.matrix).invert(),k.copy(s.hit),x.copy(s.inBeam.position),l.updateMatrixWorld(),V(G.copy(x),o),V(D.copy(k),a),c[0].set(o.x,o.y,a.x,a.y),s.outs.forEach((m,S)=>{V(G.set(0,0,0).applyMatrix4(m.matrix).applyMatrix4(s.prism.matrix),o),V(D.set(30,0,0).applyMatrix4(m.matrix).applyMatrix4(s.prism.matrix),a),c[S+1].set(o.x,o.y,a.x,a.y)}),F.set(c[2].x,c[2].y,u.aspect),H.set(Math.atan2(c[3].w-c[3].y,c[3].z-c[3].x),Math.atan2(c[1].w-c[1].y,c[1].z-c[1].x)),V(G.copy(s.prism.position),W)}),r}
