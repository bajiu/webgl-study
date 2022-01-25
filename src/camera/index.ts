/**
 * 2022.1.25
 * 相机实现
 */

import {createGl, initVertexBuffer, setAttributeFromBuffer} from "../../lib/webgl_utils";
import {Camera} from "../../lib/Camera";
import {initShaders} from "../../lib/InitShaders";


const v_shader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 uMat;
    varying vec4 vColor;
    void main(){
        gl_Position = uMat * a_Position;
        vColor = a_Color;
    }
`

const f_shader = `
    precision mediump float;
    varying vec4 vColor;
    void main(){
        gl_FlagColor = vColor;
    }
`
const points = new Float32Array([
    -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5,
    0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5
    // 立方体的 8 个顶点
])
const colors = new Float32Array([
    1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    // 每个顶点的颜色
])

const indices = new Uint8Array([ // 面的索引，值是 points 的下标
    0, 1, 2, 0, 2, 3, // 前
    1, 4, 2, 4, 7, 2, // 右
    4, 5, 6, 4, 6, 7, // 后
    5, 3, 6, 5, 0, 3, // 左
    0, 5, 4, 0, 4, 1, // 上
    7, 6, 3, 7, 3, 2  // 下
])

let r = 0


const gl = createGl()
//
// const camera = new Camera()
// camera.position.x = 0.5
// camera.position.y = 0.5
// camera.position.z = 0.5
// // 设置相机的位置
//
// camera.lookAt([0, 0, 0])


const pointsVertex = initVertexBuffer(gl, points)
const colorVertex = initVertexBuffer(gl, colors)

// 面的索引 buffer
const indexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

const program = initShaders(gl, v_shader, f_shader)

// setAttributeFromBuffer(pointsVertex, 'a_Position',3)
// setAttributeFromBuffer(colorVertex, 'a_Color',3)
//
//
// gl.enable(gl.DEPTH_TEST)
// gl.clearColor(0, 0, 0, 0)
//
//
// export const draw = () => {
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
//     // gl.uniformMatrix4fv()
//     gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)
//     r += 0.01
//     requestAnimationFrame(draw)
// }
// draw()
//
// const setAttributeFromBuffer = (program: any, name: any, size = 2, stride = 0, offset = 0) => {
//     const attribute: GLint = gl.getAttribLocation(program, name)
//     gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, stride, offset)
//     gl.enableVertexAttribArray(attribute)
// }
