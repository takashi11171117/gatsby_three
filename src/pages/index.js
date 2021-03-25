import React, { useEffect } from "react"
import styled from "styled-components"
import Layout from "../components/layout"
import * as THREE from "three"
import * as dat from "dat.gui"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// markup
const IndexPage = () => {
  const clock = new THREE.Clock()
  let controls

  const onCanvasLoaded = (canvas) => {
    if (!canvas) {
      return
    }

    const width = window.innerWidth
    const height = window.innerHeight
    // Debug
    const gui = new dat.GUI()

    // Scene
    const scene = new THREE.Scene()

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader()

    // init object
    const object = new THREE.Object3D()
    scene.add(object)

    /**
     * House
     */
    // Temporary sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial({ roughness: 0.7 })
    )
    sphere.position.y = 1
    object.add(sphere)

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: "#a9c388" })
    )
    floor.rotation.x = -Math.PI * 0.5
    floor.position.y = 0
    object.add(floor)

    /**
     * Lights
     */
    // Ambient light
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5)
    gui.add(ambientLight, "intensity").min(0).max(1).step(0.001)
    scene.add(ambientLight)

    // Directional light
    const moonLight = new THREE.DirectionalLight("#ffffff", 0.5)
    moonLight.position.set(4, 5, -2)
    gui.add(moonLight, "intensity").min(0).max(1).step(0.001)
    gui.add(moonLight.position, "x").min(-5).max(5).step(0.001)
    gui.add(moonLight.position, "y").min(-5).max(5).step(0.001)
    gui.add(moonLight.position, "z").min(-5).max(5).step(0.001)
    scene.add(moonLight)

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100)
    camera.position.x = 4
    camera.position.y = 2
    camera.position.z = 5
    scene.add(camera)

    // Controls
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    // init renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // add postprocessing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // resize
    window.addEventListener("resize", () => handleResize({ camera, renderer }))

    animate({ object, composer })
  }

  // handle resize
  const handleResize = ({ camera, renderer }) => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  useEffect(() => {
    return () => {
      window.removeEventListener("resize", () => handleResize)
    }
  })

  // animation
  const animate = ({ object, composer }) => {
    const elapsedTime = clock.getElapsedTime()
    controls.update()
    window.requestAnimationFrame(() => animate({ object, composer }))
    composer.render()
  }

  return (
    <Layout>
      <Canvas ref={onCanvasLoaded} />
    </Layout>
  )
}

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
`

export default IndexPage
