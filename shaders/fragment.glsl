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
    vec4 maskTexture = texture2D(mask, gl_PointCoord);
    vec2 imageUV = vec2((pos.x + wRes * .5)/wRes, (pos.y + hRes * .5)/hRes);
    vec4 tt1 = texture2D(t1, imageUV);
    vec4 tt2 = texture2D(t2, imageUV);
    vec4 image = mix(tt1, tt2, imageTransition);

    float alpha = 1. - clamp(0., 1., abs(vP.z/1000.));
    image.a *= maskTexture.r * alpha;

    gl_FragColor = image;
}
