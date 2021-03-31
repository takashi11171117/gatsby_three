import * as THREE from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"

// asset = [
//   { id: 'tex_Floor', type: 'texture', url: 'img/texture-floor.png' },
//   { id: 'tex_wallpaper', type: 'texture', url: 'img/texture-wallpaper.png' }
// ]

export class Utils {
  static assetLoader = async (src, callback = () => {}) => {
    const dist = []

    // three.js loader
    const threeLoader = (asset) => {
      return new Promise((resolve, reject) => {
        switch (asset.type) {
          case "texture":
            new THREE.TextureLoader().load(
              asset.url,
              (tex) => {
                callback()
                resolve(tex)
              },
              null,
              reject
            )
            break
          case "json":
            new THREE.JSONLoader().load(
              asset.url,
              (tex) => {
                callback()
                resolve(tex)
              },
              null,
              reject
            )
            break
          case "mtl":
            new MTLLoader().load(
              asset.url,
              (tex) => {
                callback()
                resolve(tex)
              },
              null,
              reject
            )
            break
          case "obj":
            new MTLLoader().load(
              asset.material,
              (mtl) => {
                mtl.preload()
                const objLoader = new OBJLoader()
                objLoader.setMaterials(mtl)
                objLoader.load(
                  asset.model,
                  (model) => {
                    callback()
                    resolve(model)
                  },
                  null,
                  reject
                )
              },
              null,
              reject
            )
            break
          default:
            reject()
            break
        }
      })
    }

    const promises = []
    for (let i = 0; i < src.length; i += 1) {
      promises[i] = threeLoader(src[i])
    }
    try {
      const result = await Promise.all(promises)

      for (let i = 0; i < src.length; i += 1) {
        const key = src[i].id
        dist[key] = result[i]
      }
    } catch (err) {
      console.log(err)
    }

    return dist
  }
}
