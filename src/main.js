import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'

// ---------- Renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.outputEncoding = THREE.sRGBEncoding
document.body.appendChild(renderer.domElement)

// ---------- Scene ----------
const scene = new THREE.Scene()

// Festive background (gradient + sparkles)
const canvas = document.createElement('canvas')
canvas.width = 512
canvas.height = 512
const ctx = canvas.getContext('2d')

const gradient = ctx.createLinearGradient(0, 0, 0, 512)
gradient.addColorStop(0, '#ff9a9e')
gradient.addColorStop(0.5, '#fad0c4')
gradient.addColorStop(1, '#fbc2eb')
ctx.fillStyle = gradient
ctx.fillRect(0, 0, 512, 512)

// Add sparkles
for (let i = 0; i < 200; i++) {
  ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 90%)`
  ctx.beginPath()
  ctx.arc(
    Math.random() * 512,
    Math.random() * 512,
    Math.random() * 2,
    0,
    Math.PI * 2
  )
  ctx.fill()
}

scene.background = new THREE.CanvasTexture(canvas)

// ---------- Camera ----------
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 2, 8)

// ---------- Controls ----------
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enableZoom = true
controls.enablePan = false

// ---------- Reflective Floor ----------
const floorGeo = new THREE.PlaneGeometry(50, 50)
const floorMirror = new Reflector(floorGeo, {
  clipBias: 0.003,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio,
  color: 0x222222,
  recursion: 0,
})
floorMirror.material.opacity = 0.15
floorMirror.material.transparent = true
floorMirror.rotation.x = -Math.PI / 2
floorMirror.position.y = -1.2
scene.add(floorMirror)

// ---------- Gallery ----------
const images = ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg', '/5.jpg', '/6.jpg']
const textureLoader = new THREE.TextureLoader()
const rootNode = new THREE.Object3D()
scene.add(rootNode)

images.forEach((src, i) => {
  const texture = textureLoader.load(src)
  texture.colorSpace = THREE.SRGBColorSpace

  const baseNode = new THREE.Object3D()
  rootNode.add(baseNode)
  baseNode.rotation.y = (i * 2 * Math.PI) / images.length

  const imageFrame = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.15),
    new THREE.MeshBasicMaterial({ map: texture })
  )
  imageFrame.position.z = -4
  baseNode.add(imageFrame)

  const halo = new THREE.PointLight(0xffffff, 0.08, 5)
  halo.position.set(0, 1, -4)
  baseNode.add(halo)
})

// ---------- Animate ----------
function animate() {
  requestAnimationFrame(animate)
  rootNode.rotation.y += 0.005
  controls.update()
  renderer.render(scene, camera)
}
animate()

// ---------- Resize ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
