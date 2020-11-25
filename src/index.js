import Engine from 'noa-engine'
import jwt_decode from 'jwt-decode'
import Toastify from 'toastify-js'
import * as Colyseus from "colyseus.js"
var user;
try {
    user = jwt_decode(window.location.hash.replace('#', ''))
} catch {
    user = {
        "name": "No User Logged In",
        "picture": "https://via.placeholder.com/300",
        "iss": "https://securetoken.google.com/samuelstream-b7231",
        "aud": "samuelstream-b7231",
        "auth_time": 1604866489,
        "user_id": "beep",
        "sub": "beep",
        "iat": 1605053021,
        "exp": 1605056621,
        "email": "samuelsharp4@gmail.com",
        "email_verified": true,
        "firebase": {
            "identities": {
                "google.com": [
                    "beep"
                ],
                "email": [
                    "beep@example.com"
                ]
            },
            "sign_in_provider": "google.com"
        }
    }
}
var client = new Colyseus.Client('wss://dev.lines.samuelsharp.com')
client.joinOrCreate("game").then(room => {
    Toastify({
        text: `Joined room ${room.id} as ${user.name}`,
        duration: 5000,
        close: false,
        gravity: 'top',
        position: 'left',
        backgroundColor: "#009b3a",
        stopOnFocus: true,
    }).showToast()
    document.querySelector('#noa-canvas').style.display = 'block'
    document.querySelector('#reticle').style.display = 'block'
    console.log(room)
}).catch(e => {
    console.log("JOIN ERROR", e)
})
const noa = new Engine({
    chunkSize: 32,
    chunkAddDistance: 2.5,
    chunkRemoveDistance: 3.5,
})
noa.registry.registerMaterial('bkg', [0, 165, 224], null)
noa.registry.registerMaterial('line', [0, 0, 0], null)
const bkgID = noa.registry.registerBlock(1, { material: 'bkg' })
const lineID = noa.registry.registerBlock(2, { material: 'line' })
function getVoxelID(x, y, z) {
    if (y < -3) return bkgID
    const height = 2 * Math.sin(x / 10) + 3 * Math.cos(z / 20)
    if (y < height) return bkgID
    return 0
}
noa.world.on('worldDataNeeded', function (id, data, x, y, z) {
    for (var i = 0; i < data.shape[0]; i++) {
        for (var j = 0; j < data.shape[1]; j++) {
            for (var k = 0; k < data.shape[2]; k++) {
                var voxelID = getVoxelID(x + i, y + j, z + k)
                data.set(i, j, k, voxelID)
            }
        }
    }
    noa.world.setChunkData(id, data)
})
var player = noa.playerEntity
var dat = noa.entities.getPositionData(player)
var w = dat.width
var h = dat.height
import { Mesh } from '@babylonjs/core/Meshes/mesh'
var scene = noa.rendering.getScene()
var mesh = Mesh.CreateBox('player-mesh', 1, scene)
mesh.scaling.x = w
mesh.scaling.z = w
mesh.scaling.y = h
noa.entities.addComponent(player, noa.entities.names.mesh, {
    mesh: mesh,
    offset: [0, h / 2, 0],
})
setInterval(() => {
    noa.setBlock(lineID, Math.round(noa.ents.getPosition(noa.playerEntity)[0]), Math.round(noa.ents.getPosition(noa.playerEntity)[1]) - 1, Math.round(noa.ents.getPosition(noa.playerEntity)[2]))
}, 1)