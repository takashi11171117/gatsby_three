import React, { useEffect, useState, useRef } from "react"
import styled from "styled-components"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import Layout from "../components/layout"
import { Utils } from "../common/helper/Utils"
import * as Assets from "../assets/Assets"

// markup
const IndexPage = () => {
  const clock = new THREE.Clock()
  let controls, ghost1, ghost2, ghost3
  const [assetsCount, setAssetsCount] = useState(0)
  const [isMounted, setIsMounted] = useState()
  const canvasRef = useRef()

  useEffect(() => {
    const onCanvasLoaded = async () => {
      if (!canvasRef.current) {
        return
      }

      const width = window.innerWidth
      const height = window.innerHeight

      // Scene
      const scene = new THREE.Scene()

      const dat = await import("dat.gui")
      const gui = new dat.GUI()

      // Asset load
      const assets = await Utils.assetLoader(Assets.house, () => {
        console.log("iiii")
        setAssetsCount((prev) => prev + 1)
      })

      assets["roofColorTexture"].repeat.set(1.5, 1.5)
      assets["roofAoTexture"].repeat.set(1.5, 1.5)
      assets["roofHeightTexture"].repeat.set(1.5, 1.5)
      assets["roofNormalTexture"].repeat.set(1.5, 1.5)
      assets["roofRoughnessTexture"].repeat.set(1.5, 1.5)

      assets["roofColorTexture"].wrapS = THREE.RepeatWrapping
      assets["roofAoTexture"].wrapS = THREE.RepeatWrapping
      assets["roofNormalTexture"].wrapS = THREE.RepeatWrapping
      assets["roofRoughnessTexture"].wrapS = THREE.RepeatWrapping

      assets["roofColorTexture"].wrapT = THREE.RepeatWrapping
      assets["roofAoTexture"].wrapT = THREE.RepeatWrapping
      assets["roofNormalTexture"].wrapT = THREE.RepeatWrapping
      assets["roofRoughnessTexture"].wrapT = THREE.RepeatWrapping

      assets["grassColorTexture"].repeat.set(8, 8)
      assets["grassAoTexture"].repeat.set(8, 8)
      assets["grassNormalTexture"].repeat.set(8, 8)
      assets["grassRoughnessTexture"].repeat.set(8, 8)

      assets["grassColorTexture"].wrapS = THREE.RepeatWrapping
      assets["grassAoTexture"].wrapS = THREE.RepeatWrapping
      assets["grassNormalTexture"].wrapS = THREE.RepeatWrapping
      assets["grassRoughnessTexture"].wrapS = THREE.RepeatWrapping

      assets["grassColorTexture"].wrapT = THREE.RepeatWrapping
      assets["grassAoTexture"].wrapT = THREE.RepeatWrapping
      assets["grassNormalTexture"].wrapT = THREE.RepeatWrapping
      assets["grassRoughnessTexture"].wrapT = THREE.RepeatWrapping

      // init object
      const object = new THREE.Object3D()
      scene.add(object)

      // Gopher
      const gopher = assets["gopherModel"]
      gopher.position.z = 3
      gopher.rotation.y = Math.PI * 0.25
      gopher.castShadow = true
      let count = 0
      gopher.traverse(function (child) {
        child.castShadow = true
        if (count === 1 && child instanceof THREE.Mesh) {
          child.material.map = assets["gopherTexture"]
          child.material.flatShading = false
        }
        count++
      })
      object.add(gopher)

      /**
       * House
       */
      const house = new THREE.Group()
      scene.add(house)

      // Wall
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: "#fff",
        map: assets["bricksColorTexture"],
        aoMap: assets["bricksAoTexture"],
        normalMap: assets["bricksNormalTexture"],
        roughnessMap: assets["bricksRoughnessTexture"],
      })
      const walls1 = new THREE.Mesh(
        new THREE.BoxBufferGeometry(4, 2.5, 4),
        wallMaterial
      )
      walls1.castShadow = true
      walls1.position.x = 1
      walls1.position.y = 1.25

      const walls2 = new THREE.Mesh(
        new THREE.BoxBufferGeometry(2, 5, 2),
        wallMaterial
      )
      walls2.castShadow = true
      walls2.position.x = -2
      walls2.position.y = 2.5
      walls2.position.z = -1

      house.add(walls1, walls2)

      // Roof
      const roofMaterial = new THREE.MeshStandardMaterial({
        color: "#ff0000",
        map: assets["roofColorTexture"],
        aoMap: assets["roofAoTexture"],
        normalMap: assets["roofNormalTexture"],
        roughnessMap: assets["roofRoughnessTexture"],
        roughness: 0.1,
        displacementMap: assets["roofHeightTexture"],
        displacementScale: 0.1,
        metalness: 0.1,
      })
      const roof1 = new THREE.Mesh(
        new THREE.ConeBufferGeometry(2.84, 1, 4),
        roofMaterial
      )
      roof1.geometry.setAttribute(
        "uv2",
        new THREE.Float32BufferAttribute(roof1.geometry.attributes.uv.array, 2)
      )
      roof1.position.x = 1
      roof1.position.y = 2.98
      roof1.rotation.y = Math.PI * 0.25

      // Roof
      const roof2 = new THREE.Mesh(
        new THREE.ConeBufferGeometry(1.42, 3, 4),
        roofMaterial
      )
      roof2.position.x = -2
      roof2.position.y = 6.5
      roof2.position.z = -1
      roof2.rotation.y = Math.PI * 0.25

      house.add(roof1, roof2)

      // Door
      const doorMaterial = new THREE.MeshStandardMaterial({
        map: assets["doorColorTexture"],
        transparent: true,
        alphaMap: assets["doorAlphaTexture"],
        aoMap: assets["doorAmbientOcclusionTexture"],
        displacementMap: assets["doorHeightTexture"],
        displacementScale: 0.03,
        normalMap: assets["doorNormalTexture"],
        metalnessMap: assets["doorMetalnessTexture"],
        roughnessMap: assets["doorRoughnessTexture"],
      })
      const door1 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2, 100, 100),
        doorMaterial
      )
      door1.position.x = 1
      door1.position.y = 1
      door1.position.z = 2 + 0.01

      const door2 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2),
        doorMaterial
      )
      door2.position.x = -3 - 0.01
      door2.position.y = 1
      door2.position.z = -1
      door2.rotation.y = -Math.PI * 0.5

      house.add(door1, door2)

      // Window
      const windowMaterial = new THREE.MeshStandardMaterial({
        color: "#724e13",
        map: assets["windowColorTexture"],
        alphaMap: assets["windowAlphaTexture"],
        transparent: true,
        aoMap: assets["windowAoTexture"],
        displacementMap: assets["windowHeightTexture"],
        displacementScale: 2,
        normalMap: assets["windowNormalTexture"],
        metalnessMap: assets["windowMetalnessTexture"],
        roughnessMap: assets["windowRoughnessTexture"],
      })
      const window1 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        windowMaterial
      )
      window1.position.x = -3 - 0.02
      window1.position.y = 4
      window1.position.z = -1
      window1.rotation.y = -Math.PI * 0.5

      const windowBack1 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(0.9, 0.7),
        new THREE.MeshStandardMaterial({
          color: "#000",
        })
      )
      windowBack1.position.x = -3 - 0.01
      windowBack1.position.y = 4
      windowBack1.position.z = -1
      windowBack1.rotation.y = -Math.PI * 0.5

      const window2 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        windowMaterial
      )
      window2.position.x = -1 + 0.02
      window2.position.y = 4
      window2.position.z = -1
      window2.rotation.y = Math.PI * 0.5

      const windowBack2 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(0.9, 0.7),
        new THREE.MeshStandardMaterial({
          color: "#000",
        })
      )
      windowBack2.position.x = -1 + 0.01
      windowBack2.position.y = 4
      windowBack2.position.z = -1
      windowBack2.rotation.y = Math.PI * 0.5

      const window3 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 1),
        windowMaterial
      )
      window3.position.x = 3 + 0.02
      window3.position.y = 1.25
      window3.position.z = 0
      window3.rotation.y = Math.PI * 0.5

      const windowBack3 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1.8, 0.7),
        new THREE.MeshStandardMaterial({
          color: "#000",
        })
      )
      windowBack3.position.x = 3 + 0.01
      windowBack3.position.y = 1.25
      windowBack3.position.z = 0
      windowBack3.rotation.y = Math.PI * 0.5

      const window4 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 1),
        windowMaterial
      )
      window4.position.x = 1 + 0.01
      window4.position.y = 1.25
      window4.position.z = -2 - 0.02
      window4.rotation.y = Math.PI * 1

      const windowBack4 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1.8, 0.7),
        new THREE.MeshStandardMaterial({
          color: "#000",
        })
      )
      windowBack4.position.x = 1 + 0.01
      windowBack4.position.y = 1.25
      windowBack4.position.z = -2 - 0.01
      windowBack4.rotation.y = Math.PI * 1

      house.add(
        window1,
        windowBack1,
        window2,
        windowBack2,
        window3,
        windowBack3,
        window4,
        windowBack4
      )

      // Bushes
      const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
      const bushMaterial = new THREE.MeshStandardMaterial({
        map: assets["grass2ColorTexture"],
        aoMap: assets["grass2AoTexture"],
        normalMap: assets["grass2NormalTexture"],
        roughnessMap: assets["grass2RoughnessTexture"],
      })

      const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush1.castShadow = true
      bush1.scale.set(0.5, 0.5, 0.5)
      bush1.position.set(2.5, 0.2, 2.2)

      const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush2.castShadow = true
      bush2.scale.set(0.25, 0.25, 0.25)
      bush2.position.set(2.9, 0.1, 2.1)

      const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush3.castShadow = true
      bush3.scale.set(0.3, 0.3, 0.3)
      bush3.position.set(-0.3, 0.1, 2.1)

      const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush4.castShadow = true
      bush4.scale.set(0.42, 0.42, 0.42)
      bush4.position.set(-0.5, 0.1, 2.1)

      const bush5 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush5.castShadow = true
      bush5.scale.set(0.6, 0.6, 0.6)
      bush5.position.set(-0.5, 0.1, -2.1)

      house.add(bush1, bush2, bush3, bush4, bush5)

      // Graves
      const graves = new THREE.Group()
      scene.add(graves)

      const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1)
      const graveMaterial = new THREE.MeshStandardMaterial({
        color: "#666666",
        map: assets["bricksColorTexture"],
        aoMap: assets["bricksAoTexture"],
        normalMap: assets["bricksNormalTexture"],
        roughnessMap: assets["bricksRoughnessTexture"],
      })

      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2 // Random angle
        const radius = 4 + Math.random() * 6 // Random radius
        const x = Math.cos(angle) * radius // Get the x position using cosinus
        const z = Math.sin(angle) * radius // Get the z position using sinus

        // Create the mesh
        const grave = new THREE.Mesh(graveGeometry, graveMaterial)
        grave.castShadow = true

        // Position
        grave.position.set(x, 0.3, z)

        // Rotation
        grave.rotation.z = (Math.random() - 0.5) * 0.4
        grave.rotation.y = (Math.random() - 0.5) * 0.4

        // Add to the graves container
        graves.add(grave)
      }

      // Floor
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({
          map: assets["grassColorTexture"],
          aoMap: assets["grassAoTexture"],
          normalMap: assets["grassNormalTexture"],
          roughnessMap: assets["grassRoughnessTexture"],
        })
      )
      floor.receiveShadow = true
      floor.rotation.x = -Math.PI * 0.5
      floor.position.y = 0
      object.add(floor)

      /**
       * Lights
       */
      // Ambient light
      const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.8)
      gui.add(ambientLight, "intensity").min(0).max(1).step(0.001)
      scene.add(ambientLight)

      // Directional light
      const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.12)
      moonLight.castShadow = true
      moonLight.position.set(4, 5, -2)
      gui.add(moonLight, "intensity").min(0).max(1).step(0.001)
      gui.add(moonLight.position, "x").min(-5).max(5).step(0.001)
      gui.add(moonLight.position, "y").min(-5).max(5).step(0.001)
      gui.add(moonLight.position, "z").min(-5).max(5).step(0.001)
      scene.add(moonLight)

      // Door light
      const doorLight = new THREE.PointLight("#ff7d46", 1, 7)
      doorLight.castShadow = true
      doorLight.shadow.mapSize.width = 256
      doorLight.shadow.mapSize.height = 256
      doorLight.shadow.camera.far = 7

      doorLight.position.set(0, 2.2, 2.7)
      house.add(doorLight)

      /**
       * Ghosts
       */
      ghost1 = new THREE.PointLight("#ff00ff", 3, 3)
      ghost1.castShadow = true
      ghost1.shadow.mapSize.width = 256
      ghost1.shadow.mapSize.height = 256
      ghost1.shadow.camera.far = 7

      ghost2 = new THREE.PointLight("#00ffff", 3, 3)
      ghost2.castShadow = true
      ghost2.shadow.mapSize.width = 256
      ghost2.shadow.mapSize.height = 256
      ghost2.shadow.camera.far = 7

      ghost3 = new THREE.PointLight("#ff7800", 3, 3)
      ghost3.castShadow = true
      ghost3.shadow.mapSize.width = 256
      ghost3.shadow.mapSize.height = 256
      ghost3.shadow.camera.far = 7
      object.add(ghost1, ghost2, ghost3)

      /**
       * Fog
       */
      const fog = new THREE.Fog("#262837", 1, 15)
      scene.fog = fog

      /**
       * Camera
       */
      // Base camera
      const camera = new THREE.PerspectiveCamera(470, width / height, 0.1, 100)
      camera.position.x = 4
      camera.position.y = 2
      camera.position.z = 5
      scene.add(camera)

      // Controls
      controls = new OrbitControls(camera, canvasRef.current)
      controls.enableDamping = true

      // init renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
      })
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.setClearColor("#262837")
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // add postprocessing
      const composer = new EffectComposer(renderer)
      const renderPass = new RenderPass(scene, camera)
      composer.addPass(renderPass)

      // resize
      window.addEventListener("resize", () =>
        handleResize({ camera, renderer })
      )

      animate({ object, composer })
    }

    if (!isMounted) {
      setIsMounted(true)
      onCanvasLoaded()
      return
    }
  }, [])

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

    // Ghosts
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3)

    const ghost2Angle = -elapsedTime * 0.32
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    const ghost3Angle = -elapsedTime * 0.18
    ghost3.position.x =
      Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
    ghost3.position.z =
      Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    controls.update()
    window.requestAnimationFrame(() => animate({ object, composer }))
    composer.render()
  }

  return (
    <Layout>
      <Progress>
        <p css="font-size: 24px;margin-bottom: 8px;font-weight:bold;">
          Loading...
        </p>
        <p>{Math.floor(((assetsCount + 1) / Assets.house.length) * 100)}%</p>
      </Progress>
      <Canvas ref={canvasRef} />
    </Layout>
  )
}

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
`
const Progress = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
`

export default IndexPage
