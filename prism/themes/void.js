import*as e from"../vendor/three/build/three.module.min.js";import{stage as _,GLSL as M}from"./index.js";export const meta={name:"Void",blurb:"A black hole and its blazing accretion disk",element:"gravity",colors:"native"};const p=2.6,S=12.5,x=13.5,v=`#include <colorspace_fragment>
}`,$=`uniform mat4 uInv, uProjInv, uCam, uSky; uniform float uTime, uSteps, uLite; uniform vec3 uTint, uInk; varying vec2 vNdc;
${M.noise}
vec3 hash3(vec3 p){ p = fract(p * vec3(443.897, 441.423, 437.195)); p += dot(p, p.yxz + 19.19); return fract((p.xxy + p.yxx) * p.zyx); }
vec3 starLayer(vec3 d, float k, float keep){
  vec3 q = d * k, id = floor(q), h = hash3(id); if (h.x > keep) return vec3(0.0);
  vec3 s = normalize(id + 0.25 + 0.5 * hash3(id + 7.1)); float dd = length(s - d) * k;
  float tw = 0.75 + 0.25 * sin(uTime * (1.0 + 3.0 * h.y) + h.z * 50.0);
  return mix(vec3(0.65, 0.78, 1.0), vec3(1.0, 0.82, 0.6), h.z) * exp(-dd * dd * 160.0) * (0.15 + 0.9 * h.y * h.y * h.y) * tw;
}
vec3 sky(vec3 d){
  d = mat3(uSky) * d;
  vec3 c = starLayer(d, 90.0, 0.12) + starLayer(d, 200.0, 0.08) * 0.6;
  float band = exp(-pow(d.y + 0.35 * d.x, 2.0) * 7.0), n = uLite > 0.5 || band < 0.02 ? 0.5 : snoise(d * 2.2) * 0.5 + 0.5;
  return c + uTint * pow(n, 3.0) * band * 0.06 + vec3(0.25, 0.12, 0.4) * pow(1.0 - n, 4.0) * band * 0.02;
}
vec3 heat(float t){   // blackbody-ish: deep red, orange, yellow-white, blue-white
  vec3 c = mix(vec3(1.0, 0.16, 0.02), vec3(1.0, 0.5, 0.12), smoothstep(0.1, 0.55, t));
  c = mix(c, vec3(1.0, 0.85, 0.6), smoothstep(0.5, 1.0, t));
  return mix(c, vec3(0.78, 0.86, 1.0), smoothstep(1.2, 2.0, t));
}
vec4 disk(vec3 p, vec3 dir){
  float r = length(p.xz); if (r < ${p.toFixed(2)} || r > ${S.toFixed(2)}) return vec4(0.0);
  float a = atan(p.z, p.x) - uTime * 2.2 / (r * sqrt(r)), lr = log(r);       // the pattern turns at the Kepler speed
  float sa = a + lr * 2.2;                                                   // and spirals inward
  float n1 = snoise(vec3(lr * 4.0 - uTime * 0.05, cos(sa) * 2.6, sin(sa) * 2.6));
  float n2 = snoise(vec3(lr * 11.0 - uTime * 0.12, cos(sa + n1 * 0.6) * 6.0, sin(sa + n1 * 0.6) * 6.0));
  float n3 = snoise(vec3(lr * 30.0, cos(sa) * 14.0, sin(sa) * 14.0));
  float dens = clamp(0.48 + 0.34 * n1 + 0.22 * n2 + 0.1 * n3, 0.0, 1.0);
  // bright clumps falling in along the spiral
  vec2 g = vec2(lr * 9.0 + uTime * 0.25, sa * 7.0 / 6.2832); vec2 gi = floor(g), gf = fract(g) - 0.5; vec3 gh = hash3(vec3(gi, 3.0));
  float clump = gh.x > 0.7 ? exp(-dot(gf - (gh.yz - 0.5) * 0.6, gf - (gh.yz - 0.5) * 0.6) * 60.0) : 0.0;
  float edge = smoothstep(${p.toFixed(2)}, ${(p+.5).toFixed(2)}, r) * smoothstep(${S.toFixed(2)}, ${(S-5).toFixed(2)}, r);
  float T = 1.25 * pow(${p.toFixed(2)} / r, 0.75);
  float beta = sqrt(0.5 / r), cosA = dot(normalize(vec3(-p.z, 0.0, p.x)), -dir);
  float g1 = sqrt(1.0 - beta * beta) / (1.0 - beta * cosA) * sqrt(1.0 - 1.0 / r);   // Doppler and gravitational shift
  float t = T * g1;
#ifdef LIGHT
  float al = clamp((dens * 0.8 + clump) * edge * 0.9, 0.0, 1.0); return vec4(heat(t) * 0.92 * al, al);   // premultiplied
#else
  return vec4(heat(t) * pow(t, 2.0) * 0.85 * (dens * 0.9 + clump * 2.0) * edge, clamp(dens * edge * 1.15, 0.0, 1.0));
#endif
}
void main(){
  vec4 v = uProjInv * vec4(vNdc, 1.0, 1.0);
  vec3 rdw = normalize(mat3(uCam) * (v.xyz / v.w));
  vec3 ro = (uInv * vec4(cameraPosition, 1.0)).xyz, rd = normalize(mat3(uInv) * rdw);
  float tc = -dot(ro, rd); vec3 cl = ro + rd * tc; float b = length(cl);
  vec3 col = vec3(0.0); float A = 0.0; bool hit = false; vec3 dir = rd;
  if (b < ${(x-.5).toFixed(1)} && tc > 0.0) {
    vec3 x = ro + rd * max(tc - sqrt(max(${(x*x).toFixed(1)} - b * b, 0.0)), 0.0), vel = rd;
    float h2 = dot(cross(x, vel), cross(x, vel));
    for (int i = 0; i < 200; i++) {
      if (float(i) >= uSteps) break;
      float r2 = dot(x, x), r = sqrt(r2);
      if (r < 1.0) { hit = true; break; }
      float dt = clamp(0.11 * r - 0.05, 0.03, 1.2);
      vec3 acc = -1.5 * h2 * x / (r2 * r2 * r);
      vec3 xn = x + vel * dt + 0.5 * acc * dt * dt;
      float n2 = dot(xn, xn);
      vel += 0.5 * (acc - 1.5 * h2 * xn / (n2 * n2 * sqrt(n2))) * dt;
      if (x.y * xn.y < 0.0) {                                                // crossed the disk
        vec4 d = disk(mix(x, xn, x.y / (x.y - xn.y)), normalize(vel));
        col += (1.0 - A) * d.rgb; A += (1.0 - A) * d.a;
        if (A > 0.97) break;
      }
      x = xn;
      if (length(x) > ${x.toFixed(1)} && dot(x, vel) > 0.0) break;           // escaped
    }
    // add the bending the march leaves out beyond its sphere, on the way in and out, so the sky has no seams
    dir = normalize(vel); float s0 = dot(x, dir); vec3 xp = x - dir * s0; float bo = length(xp);
    dir = normalize(dir - xp / bo * (2.0 * (1.0 - s0 / length(x)) / bo));
  } else if (tc > 0.0) dir = normalize(rd - cl / b * (2.0 / b));             // far away: a gentle bend
  float ring = exp(-pow((b - 2.62) / 0.045, 2.0)) * step(0.0, tc);           // the photon ring, just outside the shadow
#ifdef LIGHT
  // light mode: an ink drawing. Solid shadow, the disk in saturated color, stars as dark specks
  vec3 sk = sky(dir); float k = hit ? 1.0 : clamp(max(sk.r, max(sk.g, sk.b)) * 0.6 + ring * 0.8, 0.0, 1.0);
  col += (1.0 - A) * uInk * k; A += (1.0 - A) * k;                        // premultiplied, then straight for the blend
  gl_FragColor = vec4(col / max(A, 0.001), A);
#else
  if (!hit) col += (1.0 - A) * (sky(dir) + vec3(1.0, 0.82, 0.6) * ring * 0.7);
  gl_FragColor = vec4(col, 1.0);
#endif
${v}`,R="varying vec3 vW, vN; varying float vU; void main(){ vU = uv.y; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }",W=`uniform float uTime; uniform vec3 uC; varying vec3 vW, vN; varying float vU;
${M.noise}
void main(){
  float ndv = abs(dot(normalize(vN), normalize(cameraPosition - vW)));
  float flow = 0.6 + 0.4 * snoise(vec3(vU * 9.0 - uTime * 1.4, ndv * 2.0, 0.0));
  float I = pow(ndv, 3.0) * flow * smoothstep(0.06, 0.3, vU) * pow(1.0 - vU, 1.4);
#ifdef LIGHT
  gl_FragColor = vec4(uC, I * 0.3);
#else
  gl_FragColor = vec4(uC * I * 0.07, 1.0);
#endif
${v}`,q=`attribute vec3 aRnd; uniform float uTime, uScale; uniform vec3 uHole; uniform float uShadow; varying vec3 vCol; varying float vA;
void main(){
  float k = fract(aRnd.x - uTime * (0.006 + 0.01 * aRnd.y));                 // 1 = far out, 0 = falling in
  float r = 12.0 + k * 26.0, a = aRnd.z * 6.2832 + uTime * 3.0 / (r * sqrt(r)) + log(r) * 1.4;
  vec3 p = vec3(cos(a) * r, (aRnd.y - 0.5) * (0.3 + r * 0.04), sin(a) * r);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 c = projectionMatrix * mv, h = projectionMatrix * vec4(uHole, 1.0);
  float behind = step(mv.z, uHole.z), near = length((c.xy / c.w - h.xy / h.w) * vec2(${(16/9).toFixed(3)}, 1.0));
  vA = smoothstep(0.0, 0.25, k) * smoothstep(1.0, 0.8, k) * (1.0 - behind * smoothstep(uShadow * 3.0, uShadow * 1.5, near));
  vCol = mix(vec3(1.0, 0.45, 0.12), vec3(1.0, 0.8, 0.55), aRnd.y) * (0.25 + 0.75 * (1.0 - k));
  gl_PointSize = max(1.0, (0.03 + 0.04 * aRnd.y) * uScale / -mv.z);
  gl_Position = c;
}`,G=`varying vec3 vCol; varying float vA;
void main(){ float r = length(gl_PointCoord - 0.5), a = smoothstep(0.5, 0.0, r) * vA;
#ifdef LIGHT
  gl_FragColor = vec4(vCol * 0.6, a * 0.6);
#else
  gl_FragColor = vec4(vCol * a * 0.35, 1.0);
#endif
${v}`;function L(t){const a=new t.Group;a.add(new t.Mesh(new t.SphereGeometry(1.3,48,32),new t.MeshBasicMaterial({color:0})));const r=new t.Mesh(new t.RingGeometry(1.6,5,128,1).rotateX(-Math.PI/2),new t.ShaderMaterial({transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.AdditiveBlending,uniforms:{uTime:{value:0}},vertexShader:"varying vec3 vO; void main(){ vO = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform float uTime; varying vec3 vO;
${M.noise}
void main(){ float r = length(vO.xz), a = atan(vO.z, vO.x) - uTime * 2.0 / (r * sqrt(r)); float n = 0.55 + 0.45 * snoise(vec3(log(r) * 5.0, cos(a + log(r) * 2.2) * 1.5, sin(a + log(r) * 2.2) * 1.5));
  float t = 1.3 * pow(1.6 / r, 0.8); vec3 c = mix(vec3(1.0, 0.3, 0.05), vec3(1.0, 0.85, 0.6), t) * n * t * smoothstep(5.0, 3.0, r) * smoothstep(1.6, 2.0, r);
  gl_FragColor = vec4(c, 1.0);
${v}`}));a.add(r);const s=new t.Mesh(new t.PlaneGeometry(9,9),new t.ShaderMaterial({transparent:!0,depthWrite:!1,blending:t.AdditiveBlending,vertexShader:"varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec2 vP;
void main(){ float d = length(vP), a = atan(vP.y, vP.x);
  vec3 c = vec3(1.0, 0.85, 0.62) * exp(-pow((d - 1.42) / 0.035, 2.0)) * 1.3 + vec3(1.0, 0.55, 0.2) * exp(-pow((d - 1.75) / 0.35, 2.0)) * (0.25 + 0.5 * pow(abs(sin(a)), 3.0)) * 0.7;
  gl_FragColor = vec4(c, 1.0);
${v}`})),o=new t.Quaternion;return s.onBeforeRender=(c,u,i)=>{a.getWorldQuaternion(o),s.quaternion.copy(o.invert().multiply(i.quaternion))},a.add(s),a.userData.tick=c=>{r.material.uniforms.uTime.value=c},a}export const models={blackhole:t=>L(t)};export function start(t,a){const r=_(e,t,a,{fov:40,fog:null,lights:!1,bloom:{strength:.85,radius:.45,threshold:.55}}),{rig:s,camera:o,scene:c,lite:u,light:i}=r,m=a.colors,g=i?{LIGHT:1}:{};i||(c.background=new e.Color(0));const n=new e.Group;n.rotation.set(.17,0,-.07),s.add(n);const A=new e.Color(m.accent).lerp(new e.Color(6970623),.4),d={uInv:{value:new e.Matrix4},uProjInv:{value:o.projectionMatrixInverse},uCam:{value:o.matrixWorld},uSky:{value:new e.Matrix4},uTime:{value:0},uSteps:{value:u?90:170},uLite:{value:u?1:0},uTint:{value:A},uInk:{value:new e.Color(m.ink)}},y=new e.Mesh(new e.PlaneGeometry(2,2),new e.ShaderMaterial({vertexShader:"varying vec2 vNdc; void main(){ vNdc = position.xy; gl_Position = vec4(position.xy, 0.999, 1.0); }",fragmentShader:$,uniforms:d,defines:g,depthWrite:!1,depthTest:!1,transparent:i}));y.frustumCulled=!1,y.renderOrder=-10,c.add(y);const T=new e.CylinderGeometry(1.5,.15,24,24,1,!0).translate(0,14,0),F={uTime:d.uTime,uC:{value:i?new e.Color(m.accent):new e.Color(10139903).lerp(new e.Color(m.accent),.35)}};for(const l of[1,-1]){const h=new e.Mesh(T,new e.ShaderMaterial({vertexShader:R,fragmentShader:W,uniforms:F,defines:g,transparent:!0,depthWrite:!1,blending:i?e.NormalBlending:e.AdditiveBlending}));h.scale.y=l,h.frustumCulled=!1,n.add(h)}const w=u?1500:4e3,I=new Float32Array(w*3),z=new Float32Array(w*3);for(let l=0;l<w;l++)z.set([Math.random(),Math.random(),Math.random()],l*3);const b=new e.BufferGeometry;b.setAttribute("position",new e.BufferAttribute(I,3)),b.setAttribute("aRnd",new e.BufferAttribute(z,3));const f={uTime:d.uTime,uScale:{value:600},uHole:{value:new e.Vector3},uShadow:{value:.2}},C=new e.Points(b,new e.ShaderMaterial({vertexShader:q,fragmentShader:G,uniforms:f,defines:g,transparent:!0,depthWrite:!1,blending:i?e.NormalBlending:e.AdditiveBlending}));C.frustumCulled=!1,n.add(C),o.position.set(0,1.4,28),o.lookAt(s.position.x*.45,0,0),o.updateMatrixWorld();const k=new e.Vector3,P=new e.Matrix4;return r.run((l,h)=>{d.uTime.value=l,n.rotation.x=.17-r.pointer.y*.05,n.rotation.y=r.pointer.x*.08,n.updateWorldMatrix(!0,!1),d.uInv.value.copy(n.matrixWorld).invert(),d.uSky.value.copy(P.makeRotationY(l*.012)),f.uScale.value=r.renderer.domElement.height/(2*Math.tan(e.MathUtils.degToRad(o.fov/2))),k.setFromMatrixPosition(n.matrixWorld).applyMatrix4(o.matrixWorldInverse),f.uHole.value.copy(k),f.uShadow.value=2.6*s.scale.x/(-k.z*Math.tan(e.MathUtils.degToRad(o.fov/2)))}),r}
