import {createGl, initVertexBuffer, setAttributeFromBuffer} from "../../lib/webgl_utils";
import {initShaders} from "../../lib/InitShaders";
import {getDoseData} from "../../utils";
import {Mat4} from "cuon-matrix";
import {DoseRender} from "./DoseRender";
import {DoseRender1} from "./DoseRender1";
// import {DoseRender} from "./DoseRender";

const v_shader = `
  attribute vec4 a_Position;
  attribute float a_Value;
  varying float value;
  uniform mat4 u_Matrix;
  void main() {
    if(a_Value > 0.0) {
      gl_Position = vec4(a_Position.x, a_Position.y,a_Position.z, 170.0) * u_Matrix;
      gl_PointSize = 3.0;
      value = a_Value;
    }
  }
`;

const f_shader = `
  precision mediump float;
  varying float value; 
  void main() {
    if (value > 30.0) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
      }
  }
`;
// 全局数据


// const render = async () => {
//      const gl = createGl()
//
//     const program = initShaders(gl, v_shader, f_shader)
//     if (!program) {
//         console.error('what`s wrong with me?');
//     }
//
// // 获取dose数据
//     const data = await getDoseData()
//     const len = data.length
//     const vertices = new Float32Array(data)
//     const FSIZE = vertices.BYTES_PER_ELEMENT
//
//     initVertexBuffer(gl, vertices)
//     setAttributeFromBuffer(gl, 'a_Position', 3, FSIZE * 4, 0)
//     setAttributeFromBuffer(gl, 'a_Value', 1, FSIZE * 4, FSIZE * 3)
//
//     const xformMatrix = new Mat4()
//     // xformMatrix.ortho(-2, 2, -2, 2, 0, 0.1)
//     // xformMatrix.rotate(45,0,1,0)
//     // xformMatrix.ortho(-0.5, 0.5, -0.5, 0.5, 0, 0.001)
//     // xformMatrix.lookAt(0,0,0.09,0,0,-1,0,1,0)
//     const u_xformMatrix = gl.getUniformLocation(program, 'u_Matrix')
//     gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements)
//
//
//     gl.clearColor(0.0, 0.0, 0.0, 1.0);
//     gl.clear(gl.COLOR_BUFFER_BIT);
//     // drawHelperLine(canvas, xformMatrix, 0)
//     gl.drawArrays(gl.POINTS, 0, len / 4)
//
// }

// render()

// const vertex = await getDoseData()
getDoseData().then(vertexBuffer => {
    // console.log(vertexBuffer/)

    const config = {
        el: document.getElementById('app'),
        vertexData: new Float32Array(vertexBuffer),
        colorTable: [
            // {
            //     percent: 110,
            //     color: [0, 255, 255, 255]
            // },
            // {
            //     percent: 100,
            //     color: [255, 0, 255, 255]
            // },
            // {
            //     percent: 50,
            //     color: [0, 0, 1, 1]
            // },
            // {
            //     percent: 0,
            //     color: [1, 0, 1, 1]
            // }

            {
                percent: 0,
                color: [0, 0, 255, 255]
            },
            {
                percent: 0.01,
                color: [0, 255, 0, 255]
            },
            {
                percent: 0.1,
                color: [0, 0, 0, 255]
            },
            {
                percent: 5,
                color: [255, 0, 0, 255]
            },
            // {
            //     percent: 30,
            //     color: [255, 0, 255, 255]
            // },
            // {
            //     percent: 50,
            //     color: [0, 0, 255, 255]
            // },
        ],
        doseInfo: {
            nrVoxels: [183, 198, 150]
        },
        prescriptionValue: 6600,

    }

    // todo 这里是画正常体素的 dose
    // const dose = new DoseRender(config)
    // // dose.face = 'coronal'
    // // dose.face = 'sagittal'
    //
    // dose.page = 1
    // dose.draw()
    // let page = 1
    // let angle = 0
    // document.onkeydown = (e:KeyboardEvent) => {
    //
    //     switch (e.key) {
    //         case 'w': page+=1; break;
    //         case 's': page-=1; break;
    //         case 'd': angle+=1; break;
    //         case 'a': angle-=1; break;
    //     }
    //     page = +page.toFixed(2)
    //
    //     dose.page = page
    //     dose.draw(page)
    //
    // }


    // const dose1 = new DoseRender1(config)
    // dose1.drawTexture()


    const dose = new DoseRender(config)

    let page = 1
    let angle = 0
    let face: any = 'transversal'
    dose.initFboProgram()


    dose.loadFbo()
    document.onkeydown = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'w':
                page += 1;
                break;
            case 's':
                page -= 1;
                break;
            case 'd':
                face = 'coronal';
                break;
            case 'a':
                face = 'sagittal';
                break;
        }
        page = +page.toFixed(2)
        // console.log(page)
        dose.face = face
        // dose.setFace(face)
        dose.page = page

    }


})



