import*as c from"../vendor/three/build/three.module.min.js";import{stage as b}from"./index.js";export const meta={name:"Quantum",blurb:"A particle swarm that morphs and follows your cursor",element:"energy",colors:"accent"};const p=4.4,h=2.2,w=5,A=`#include <colorspace_fragment>
}`,P=`attribute vec4 aSeed; uniform float uTime, uFrom, uTo, uMix, uMixPrev, uPart, uScale, uAspect, uSize; uniform vec2 uPointer;
uniform vec3 uA, uA2, uHot, uC0, uC1, uC2, uW;
varying vec3 vCol; varying float vA;
#define PI 3.14159265
vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotX(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
vec3 jit(vec4 s, float k){ return (vec3(fract(s.x * 91.7), fract(s.y * 57.3), fract(s.z * 33.1)) - 0.5) * k; }
vec3 knot(float u){ float r = 2.0 + cos(3.0 * u); return vec3(r * cos(2.0 * u), sin(3.0 * u), r * sin(2.0 * u)) * 0.95; }
// the logo: a glass prism outline, a white beam in, three colored beams out, light flowing along them
vec3 logo(vec4 s, float t, out vec3 tint){
  float R = 2.4, D = 0.6; vec2 A = vec2(0.0, R), B = vec2(-0.866 * R, -0.5 * R), C = vec2(0.866 * R, -0.5 * R);
  vec2 inP = mix(A, B, 0.56);
  if (s.y < 0.3) {                                                  // the prism: its nine edges
    float e = s.w < 0.9 ? floor(s.w / 0.9 * 6.0) : 6.0 + floor((s.w - 0.9) / 0.1 * 3.0), k = s.x; vec2 a2, b2; float z0 = D, z1 = D;   // particles shared by edge length
    if (e < 3.0) { a2 = e < 1.0 ? A : e < 2.0 ? B : C; b2 = e < 1.0 ? B : e < 2.0 ? C : A; }
    else if (e < 6.0) { a2 = e < 4.0 ? A : e < 5.0 ? B : C; b2 = e < 4.0 ? B : e < 5.0 ? C : A; z0 = z1 = -D; }
    else { a2 = b2 = e < 7.0 ? A : e < 8.0 ? B : C; z0 = D; z1 = -D; }
    vec3 p = mix(vec3(a2, z0), vec3(b2, z1), k) + jit(s, 0.1);
    tint = mix(uW, uA, 0.3);
    return p;
  }
  if (s.y < 0.44) {                                                 // white beam in, flowing toward the prism
    float k = fract(s.x + t * 0.25); vec2 dir = normalize(vec2(1.0, 0.29));
    tint = uW * 0.9; return vec3(inP - dir * (1.0 - k) * 7.5, 0.0) + jit(s, 0.1);
  }
  float i = floor((s.y - 0.44) / 0.56 * 3.0), k = fract(s.x + t * 0.3);    // three colored beams out, fanning wider as they go
  vec2 o = mix(A, C, 0.42 + i * 0.11); float ang = 0.34 - i * 0.335;
  tint = i < 1.0 ? uC0 : i < 2.0 ? uC1 : uC2;
  return vec3(o + vec2(cos(ang), sin(ang)) * k * 7.5, 0.0) + jit(s, 0.1 + k * 0.4);
}
vec3 shape(float id, vec4 s, float t, out vec3 tint){
  tint = vec3(0.0);
  if (id < 0.5) return logo(s, t, tint);
  if (id < 1.5) {                                                   // a sphere with waves running over it
    float z = s.y * 2.0 - 1.0, r = sqrt(1.0 - z * z), th = s.x * 2.0 * PI + t * (0.15 + 1.1 * r * r * r);   // the equator spins fastest
    vec3 p = vec3(r * cos(th), z, r * sin(th));
    return p * (2.6 + 0.16 * sin(p.y * 7.0 + t * 2.2) * sin(th * 3.0 - t * 1.3) + (s.z - 0.5) * 0.12);
  }
  if (id < 2.5) {                                                   // a torus knot with light flowing along it
    float u = s.x * 2.0 * PI + t * 0.45, v = s.y * 2.0 * PI;
    vec3 c0 = knot(u), T = normalize(knot(u + 0.01) - c0), N = normalize(cross(T, vec3(0.0, 1.0, 0.0))), Bn = cross(T, N);
    return rotX(c0 + (N * cos(v) + Bn * sin(v)) * 0.46 * s.z, 0.45);
  }
  if (id < 3.5) {                                                   // a double helix with rungs
    float y = (s.x - 0.5) * 7.5, a = y * 1.05 + t * 0.7;
    if (s.w < 0.72) { float st = s.w < 0.36 ? 0.0 : PI; return vec3(cos(a + st) * 1.5, y, sin(a + st) * 1.5) + jit(s, 0.22); }
    float yq = (floor(y * 1.4) + 0.5) / 1.4, aq = yq * 1.05 + t * 0.7, k = s.y * 2.0 - 1.0;
    return vec3(cos(aq) * 1.5 * k, yq, sin(aq) * 1.5 * k) + jit(s, 0.05);
  }
  vec3 g = floor(s.xyz * 4.0);                                      // a cube lattice: nodes and the struts between them
  vec3 p = (g - 1.5) * 1.3;
  if (s.w > 0.35) { float ax = floor((s.w - 0.35) / 0.65 * 3.0), k = (fract(s.x * 13.7) - 0.5) * 1.3;
    if (ax < 1.0) p.x += k; else if (ax < 2.0) p.y += k; else p.z += k; p += jit(s, 0.03); }
  else p += jit(s, 0.16);
  return rotX(rotY(p, t * 0.35), 0.55);
}
vec3 at(float t, float m, out vec3 tint){
  if (aSeed.w > 0.965) {                                            // a few drift round the swarm as ambient dust
    vec4 s = aSeed; float th = s.x * 2.0 * PI + t * 0.03, z = s.y * 2.0 - 1.0, r = sqrt(1.0 - z * z);
    tint = vec3(0.0); return vec3(r * cos(th), z * 0.6, r * sin(th)) * (6.0 + 8.0 * s.z) + vec3(0.0, sin(t * 0.2 + s.z * 9.0) * 0.4, 0.0);
  }
  vec3 ta, tb; vec3 a = shape(uFrom, aSeed, t, ta), b = shape(uTo, aSeed, t, tb);
  float d = aSeed.w * 0.25 + (aSeed.x - 0.5) * 0.15, e = smoothstep(0.0, 1.0, clamp((m - 0.2 - d) / 0.6, 0.0, 1.0));
  vec3 swirl = vec3(sin(a.y * 1.3 + t * 1.7), sin(a.z * 1.1 + t * 1.3), sin(a.x * 1.7 - t)) * 1.6 + normalize(a + 0.001) * 1.2;
  tint = mix(ta, tb, e);
  return rotY(mix(a, b, e) + swirl * sin(e * PI), t * 0.08);
}
void main(){
  vec3 tint, tp, p = at(uTime, uMix, tint), q = at(uTime - 0.04, uMixPrev, tp);
  float speed = length(p - q) / 0.04;
  vec3 col = mix(uA2 * 0.55, uA, smoothstep(0.1, 1.2, speed));
  col = mix(col, uHot, smoothstep(1.4, 4.5, speed));
  col = mix(col, vec3(1.0), smoothstep(6.0, 12.0, speed) * 0.7);
  if (dot(tint, tint) > 0.0) col = mix(col, tint, 0.75 * (1.0 - smoothstep(1.5, 4.0, speed)));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  // part round the cursor: push away on screen, brighten the edge
  vec4 c = projectionMatrix * mv; vec2 d = (c.xy / c.w - uPointer) * vec2(uAspect, 1.0); float dist = length(d);
  float f = uPart * exp(-dist * dist / 0.022);
  mv.xy += normalize(d + 1e-5) * f * 0.055 * -mv.z;
  vCol = col * (1.0 + f * 0.5);
  vA = 0.55 + 0.45 * aSeed.z;
  gl_PointSize = max(1.0, uSize * (0.75 + 0.5 * aSeed.z) * uScale / -mv.z);
  gl_Position = projectionMatrix * mv;
}`,k=`varying vec3 vCol; varying float vA;
void main(){ float r = length(gl_PointCoord - 0.5), a = smoothstep(0.5, 0.05, r) * vA;
#ifdef LIGHT
  gl_FragColor = vec4(vCol, a * 0.6);
#else
  gl_FragColor = vec4(vCol * a * 0.5, 1.0);
#endif
${A}`,M=`uniform vec3 uA; uniform vec2 uC; uniform float uAspect; varying vec2 vUv;
void main(){ vec2 p = (vUv * 2.0 - 1.0 - uC) * vec2(uAspect, 1.0); float g = exp(-dot(p, p) * 1.6);
#ifdef LIGHT
  gl_FragColor = vec4(uA, g * 0.08);
#else
  gl_FragColor = vec4(uA * g * 0.014, 1.0);
#endif
${A}`,f=(e,a,r,t,n)=>{const u={};return new e.Color(a).getHSL(u,e.SRGBColorSpace),new e.Color().setHSL((u.h+r+1)%1,t,n,e.SRGBColorSpace)},z=e=>{const a=e%(p+h);return a<p?0:(a-p)/h};function C(e,a,{n:r=48e3,light:t=!1,size:n=.03}={}){const u=new Float32Array(r*4);for(let i=0;i<u.length;i++)u[i]=Math.random();const l=new e.BufferGeometry;l.setAttribute("position",new e.BufferAttribute(new Float32Array(r*3),3)),l.setAttribute("aSeed",new e.BufferAttribute(u,4)),l.boundingBox=new e.Box3(new e.Vector3(-3.6,-3.6,-3.6),new e.Vector3(3.6,3.6,3.6)),l.boundingSphere=new e.Sphere(new e.Vector3,4.5);const s=a.accent,o={uTime:{value:0},uFrom:{value:0},uTo:{value:1},uMix:{value:0},uMixPrev:{value:0},uPart:{value:0},uScale:{value:600},uAspect:{value:1.6},uSize:{value:n},uPointer:{value:new e.Vector2(9,9)},uA:{value:f(e,s,0,.9,t?.4:.62)},uA2:{value:f(e,s,-.04,.8,t?.3:.45)},uHot:{value:f(e,s,.42,.95,t?.45:.66)},uC0:{value:f(e,s,0,1,t?.4:.62)},uC1:{value:f(e,s,.165,1,t?.42:.64)},uC2:{value:f(e,s,.44,1,t?.45:.66)},uW:{value:t?new e.Color(a.ink??1844258):new e.Color(1,1,1)}},d=new e.Points(l,new e.ShaderMaterial({vertexShader:P,fragmentShader:k,uniforms:o,transparent:!0,depthWrite:!1,blending:t?e.NormalBlending:e.AdditiveBlending,defines:t?{LIGHT:1}:{}}));return d.frustumCulled=!1,{pts:d,U:o,tick:i=>{const v=Math.floor(i/(p+h))%w;o.uTime.value=i,o.uFrom.value=v,o.uTo.value=(v+1)%w,o.uMix.value=z(i),o.uMixPrev.value=Math.floor((i-.04)/(p+h))%w===v?z(i-.04):0}}}export const models={swarm:(e,a,r={})=>{const t=C(e,a,{n:8e3,light:!!r.light,size:.05});return t.pts.userData.tick=n=>t.tick(n),t.tick(0),t.pts}};export function start(e,a){const r=b(c,e,a,{fov:40,fog:null,lights:!1,bloom:{strength:.7,radius:.35,threshold:.5}}),{rig:t,camera:n,scene:u,lite:l,light:s}=r;s||(u.background=new c.Color(a.colors.void));const o=C(c,a.colors,{n:l?16e3:48e3,light:s,size:l?.04:.03});t.add(o.pts);const d={uA:o.U.uA,uC:{value:new c.Vector2},uAspect:o.U.uAspect},m=new c.Mesh(new c.PlaneGeometry(2,2),new c.ShaderMaterial({vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }",fragmentShader:M,uniforms:d,transparent:!0,depthWrite:!1,depthTest:!1,blending:s?c.NormalBlending:c.AdditiveBlending,defines:s?{LIGHT:1}:{}}));m.frustumCulled=!1,m.renderOrder=-10,u.add(m),n.position.set(0,.6,17),n.lookAt(t.position.x*.45,0,0),n.updateMatrixWorld();const i=new c.Vector3;let v=0,g=0,y=-99;return r.run((x,S)=>{o.tick(x),o.U.uScale.value=r.renderer.domElement.height/(2*Math.tan(c.MathUtils.degToRad(n.fov/2))),o.U.uAspect.value=n.aspect,Math.abs(r.pointer.x-v)+Math.abs(r.pointer.y-g)>.002&&(y=x),v=r.pointer.x,g=r.pointer.y,o.U.uPart.value+=((x-y<2.5?1:0)-o.U.uPart.value)*Math.min(1,S*2.5),o.U.uPointer.value.set(v,g),i.setFromMatrixPosition(t.matrixWorld).project(n),d.uC.value.set(i.x,i.y)}),r}
