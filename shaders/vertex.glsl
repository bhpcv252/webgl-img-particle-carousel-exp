attribute float aSpeed;
attribute float aOffset;

varying vec2 pos;
varying vec3 vP;

uniform sampler2D t1;
uniform sampler2D t2;
uniform sampler2D mask;
uniform float wRes;
uniform float hRes;

uniform float time;
uniform float imageTransition;
uniform float scrollMove;
uniform float scrollPos;

void main() {
    pos = position.xy;

    vec3 p = position;

    if(mod(p.x, 2.) == 0.) {
        p.x += sin(scrollMove) * 10.;
    }
    else {
        p.x -= sin(scrollMove) * 10.;
    }

    if(mod(p.y, 2.) == 0.) {
        p.y += sin(scrollMove) * 10.;
    }
    else {
        p.y -= sin(scrollMove) * 10.;
    }

    p.z = mod(position.z + scrollMove * 50. * aSpeed * aOffset, 1500.) - 300.;
    vP = p;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 2000. * (1./ - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}