import Engine from 'noa-engine'
import jwt_decode from 'jwt-decode'
import Toastify from 'toastify-js'
import * as Colyseus from 'colyseus.js'
import * as Mousetrap from 'mousetrap'
import './gamepad';
import {
    Mesh
} from '@babylonjs/core/Meshes/mesh'
var user
var opcoords
try {
    Toastify({
        text: `Loading...`,
        duration: 3000,
        close: false,
        gravity: 'top',
        position: 'left',
        backgroundColor: "#f9461c",
        stopOnFocus: true,
    }).showToast()
    user = jwt_decode(window.location.hash.replace('#', ''))
    Toastify({
        text: `Welcome, ${user.name}`,
        duration: 3000,
        close: false,
        gravity: 'top',
        position: 'left',
        backgroundColor: "#f9461c",
        stopOnFocus: true,
    }).showToast()
} catch {
    Toastify({
        text: `Invalid token. Continuing as default user.`,
        duration: 3000,
        close: false,
        gravity: 'top',
        position: 'left',
        backgroundColor: "#c60c30",
        stopOnFocus: true,
    }).showToast()
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
        "email": "beep@example.com",
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
Toastify({
    text: `Connecting...`,
    duration: 3000,
    close: false,
    gravity: 'top',
    position: 'left',
    backgroundColor: "#f9461c",
    stopOnFocus: true,
}).showToast()
var client = new Colyseus.Client('wss://dev.lines.samuelsharp.com')
Toastify({
    text: `Joining room...`,
    duration: 3000,
    close: false,
    gravity: 'top',
    position: 'left',
    backgroundColor: "#f9461c",
    stopOnFocus: true,
}).showToast()
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
    const noa = new Engine({
        chunkSize: 64,
        chunkAddDistance: 2.5,
        chunkRemoveDistance: 3.5,
    })
    noa.registry.registerMaterial('line', [0, 0.639215686, 0.870588235], null)
    noa.registry.registerMaterial('bkg', [0.384313725, 0.211764706, 0.105882353], null)
    noa.registry.registerMaterial('opponent', [0.77647058823, 0.04705882352, 0.18823529411], null)
    const bkgID = noa.registry.registerBlock(1, {
        material: 'bkg'
    })
    const lineID = noa.registry.registerBlock(2, {
        material: 'line'
    })
    const opponentID = noa.registry.registerBlock(3, {
        material: 'opponent'
    })

    function getVoxelID(x, y, z) {
        if (y < -1) return bkgID
        if (y < 0 && Math.random() <= 0.2) return bkgID
        return 0
    }
    noa.world.on('worldDataNeeded', function(id, data, x, y, z) {
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
    var scene = noa.rendering.getScene()
    var mesh = Mesh.CreateBox('player-mesh', 1, scene)
    mesh.scaling.x = w
    mesh.scaling.z = w
    mesh.scaling.y = h
    noa.entities.addComponent(player, noa.entities.names.mesh, {
        mesh: mesh,
        offset: [0, h / 2, 0],
    })
    room.onMessage("posrecieved", (pos) => {
        if (pos.player !== room.sessionId) {
            noa.setBlock(opponentID, pos.x, pos.y - 1, pos.z)
            opcoords = [pos.x, pos.y, pos.z]
        }
    })
    Mousetrap.bind('shift', () => {
        var msg = new SpeechSynthesisUtterance(`The other player is at ${opcoords[0]}. ${opcoords[1]}. ${opcoords[2]}. Hunt them down!`)
        speechSynthesis.speak(msg)
    })

    function getplayerpos(index) {
        const number = Math.round(noa.ents.getPosition(noa.playerEntity)[index]);
        if (number == -0) {
            return 0;
        } else {
            return number;
        }
    }

    Mousetrap.bind('f', () => {
        console.log(JSON.stringify(opcoords) == JSON.stringify([getplayerpos(0), getplayerpos(1), getplayerpos(2)]))
    })
    
    setInterval(() => {
        noa.setBlock(lineID, Math.round(noa.ents.getPosition(noa.playerEntity)[0]), Math.round(noa.ents.getPosition(noa.playerEntity)[1]) - 1, Math.round(noa.ents.getPosition(noa.playerEntity)[2]))
        document.querySelector('#reticle').innerText = `${Math.round(noa.ents.getPosition(noa.playerEntity)[0])}, ${Math.round(noa.ents.getPosition(noa.playerEntity)[1])}, ${Math.round(noa.ents.getPosition(noa.playerEntity)[2])}`
        room.send("playerpos", {
            player: room.sessionId,
            x: Math.round(noa.ents.getPosition(noa.playerEntity)[0]),
            y: Math.round(noa.ents.getPosition(noa.playerEntity)[1]),
            z: Math.round(noa.ents.getPosition(noa.playerEntity)[2])
        })
    }, 100)
}).catch(e => {
    Toastify({
        text: `Error joining room: ${e}`,
        duration: 5000,
        close: false,
        gravity: 'top',
        position: 'left',
        backgroundColor: "#c60c30",
        stopOnFocus: true,
    }).showToast()
})