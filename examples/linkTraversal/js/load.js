import RayInput from '../node_modules/ray-input';
import WebVRPolyfill from '../node_modules/webvr-polyfill';

WebVRConfig = {
  BUFFER_SCALE: 1.0,
};
document.addEventListener('touchmove', function(e) {
  e.preventDefault();
});

var camera, scene, renderer;
    var texture_placeholder,
    vrControls;
    isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 0, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0,
    phi = 0, theta = 0,
    distance = 500,
    onPointerDownPointerX = 0,
    onPointerDownPointerY = 0,
    onPointerDownLon = 0,
    onPointerDownLat = 0;
    init();
    animate();
function init() {
    var container, mesh;
    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
    camera.target = new THREE.Vector3( 0, 0, 0 );
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    
    // Interactive control
    // document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    // document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    // document.addEventListener( 'wheel', onDocumentMouseWheel, false );
    //
    window.addEventListener( 'resize', onWindowResize, false );
    
    // Load video and play
    var video = document.createElement( 'video' );
    video.width = 640;
    video.height = 360;
    video.loop = true;
    video.muted = true;
    video.src = "resource/pano.webm";
    video.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );
    video.play();

    // Create a sphere geometry and video material for playing
    // video in WebGL
    var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
    geometry.scale( - 1, 1, 1 );
    var texture = new THREE.VideoTexture( video );
    texture.minFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    var material   = new THREE.MeshBasicMaterial( { map : texture } );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // Initialize VR
    // Apply VR headset positional data to camera.
    vrControls = new THREE.VRControls(camera);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseDown( event ) {
    event.preventDefault();
    isUserInteracting = true;
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
}
function onDocumentMouseMove( event ) {
    if ( isUserInteracting === true ) {
        lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
        lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
    }
}
function onDocumentMouseUp( event ) {
    isUserInteracting = false;
}
function onDocumentMouseWheel( event ) {
    distance += event.deltaY * 0.05;
}
function animate() {
    requestAnimationFrame( animate );
    update();
}
function update() {
    lat = Math.max( - 85, Math.min( 85, lat ) );
    phi = THREE.Math.degToRad( 90 - lat );
    theta = THREE.Math.degToRad( lon );
    camera.position.x = distance * Math.sin( phi ) * Math.cos( theta );
    camera.position.y = distance * Math.cos( phi );
    camera.position.z = distance * Math.sin( phi ) * Math.sin( theta );
    camera.lookAt( camera.target );
    /*
    // distortion
    camera.position.copy( camera.target ).negate();
    */
    vrControls.update();
    renderer.render( scene, camera );
}