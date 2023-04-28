import * as THREE from 'three';
import anime from 'animejs/lib/anime.es.js';
import fShader from './shaders/fragment.glsl';
import vShader from './shaders/vertex.glsl';

import maskImage from './images/particle_mask.jpeg';

import s1 from './images/1.png';
import s2 from './images/2.jpeg';
import s3 from './images/3.png';
import s4 from './images/4.jpeg';

const canvasContainer = document.querySelector(".container");

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
canvasContainer.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
camera.position.set(0, 0, 1000);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

const wRes = 512;
const hRes = 512;
const geometry = new THREE.BufferGeometry();
const positions = new THREE.BufferAttribute(new Float32Array(wRes * hRes * 3), 3);
const speeds = new THREE.BufferAttribute(new Float32Array(wRes * hRes), 1);
const offsets = new THREE.BufferAttribute(new Float32Array(wRes * hRes), 1);

let index = 0;
const ws = (wRes *.5 - wRes), we = (wRes * .5);
const hs = (hRes *.5 - hRes), he = (hRes * .5);
for(let i = ws; i < we; i++ ) {
    for(let j = hs; j < he; j++) {
        positions.setXYZ(index, i, j, 0);
        offsets.setX(index, rand(200, 800));
        speeds.setX(index, rand(0.01, 0.1));
        index++;
    }
}

geometry.setAttribute('position', positions);
geometry.setAttribute('aSpeed', speeds);
geometry.setAttribute('aOffset', offsets);

const textures = [
    new THREE.TextureLoader().load(s1),
    new THREE.TextureLoader().load(s2),
    new THREE.TextureLoader().load(s3),
    new THREE.TextureLoader().load(s4),
];

const mask = new THREE.TextureLoader().load(maskImage);

let scrollInfo = {
    scrollMove: 0,
    scrollPos: 4000,
    scrollTran: 0
}

let imageTransition = 0;
let currentImage = 0;
let nextImage = 1;

const material = new THREE.ShaderMaterial({
    uniforms: {
       wRes: {
            type: 'f',
            value: wRes
        },
        hRes: {
            type: 'f',
            value: hRes
        },
        t1: {
            type: 't',
            value: textures[3]
        },
        t2: {
            type: 't',
            value: textures[0]
        },
        t3: {
            type: 't',
            value: textures[1]
        },
        mask: {
            type: 't',
            value: mask
        },
        time: {
            type: 'f',
            value: 0.
        },
        scrollMove: {
            type: 'f',
            value: 0.
        },
        scrollPos: {
            type: 'f',
            value: 0.
        },
        imageTransition: {
            type: 'f',
            value: 0.
        }
    },
    fragmentShader: fShader,
    vertexShader: vShader,
    side: THREE.DoubleSide,
    transparent: true,
    depthTest: false,
    depthWrite: false
});

const plane =  new THREE.Points(geometry, material);
plane.position.set(0, 0, 0);
scene.add(plane);

requestAnimationFrame(animate);

function animate(time) {
    time *= .001;
    scrollInfo.scrollPos += scrollInfo.scrollMove;
    scrollInfo.scrollTran += Math.abs(scrollInfo.scrollMove);
    scrollInfo.scrollMove *= 0.9;

    if(scrollInfo.scrollPos < 0) {
        scrollInfo.scrollPos = 4000;
    }

    if(resizeCanvas(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    currentImage = Math.floor(Math.abs(scrollInfo.scrollPos% textures.length));
    nextImage = (currentImage + 1) < textures.length ? (currentImage + 1) : 0;

    imageTransition = scrollInfo.scrollPos - Math.floor(scrollInfo.scrollPos);

    material.uniforms.t1.value = textures[currentImage];
    material.uniforms.t2.value = textures[nextImage];
    material.uniforms.time.value = time;
    material.uniforms.imageTransition.value = imageTransition;
    material.uniforms.scrollMove.value = scrollInfo.scrollTran;
    material.uniforms.scrollPos.value = scrollInfo.scrollPos;

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

function resizeCanvas(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if(needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function rand(a, b) {
    return a + (b-a) * Math.random();
}

let timeout = undefined;
let posAnim = undefined;
let tranAnim = undefined;

document.addEventListener( 'wheel', function(e) {
    scrollInfo.scrollMove = e.deltaY * 0.0003;

    if(timeout !== undefined) {
        clearTimeout(timeout);
        timeout = undefined;
    }

    if(posAnim !== undefined) {
        posAnim.remove(scrollInfo);
    }


    if(tranAnim !== undefined) {
        tranAnim.remove(scrollInfo);
    }

    timeout = setTimeout(function (){
        posAnim = anime({
            targets: scrollInfo,
            scrollPos: Math.round(scrollInfo.scrollPos),
            scrollTran: 0,
            duration: 2000,
            easing: 'easeInOutCubic',
        });

        tranAnim = anime({
            targets: scrollInfo,
            scrollTran: 0,
            duration: 3000,
            easing: 'easeInOutCubic',
            update: function() {
                console.log(scrollInfo.scrollTran)
            }
        });
    }, 1000);

});
