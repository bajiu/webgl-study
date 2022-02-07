import {createProgram, initShaders} from "../../lib/InitShaders";
import {initAttributeVariable, initVertexBuffer, setAttributeFromBuffer} from "../../lib/webgl_utils";
import {Mat4} from "cuon-matrix";

const v_shader = `
  attribute vec4 a_Position;
  attribute float a_Value;
  uniform float a_Page;
  uniform float a_Slice;
  uniform float a_Face;
  varying float value;
  uniform mat4 u_Matrix;
  void main() {
    if(a_Value > 0.0) {
        if(a_Position.z == a_Page && a_Face == 1.0) {
            gl_Position = vec4(a_Position.x, a_Position.y,a_Position.z, a_Slice) * u_Matrix; 
        } else if(a_Position.y == a_Page && a_Face == 2.0) {
            gl_Position = vec4(a_Position.x, a_Position.y,a_Position.z, a_Slice) * u_Matrix;
        } else if( a_Position.x == a_Page && a_Face == 3.0){
            gl_Position = vec4(a_Position.x, a_Position.y,a_Position.z, a_Slice) * u_Matrix;
        }
        gl_PointSize = 3.5;   
        value = a_Value;
    }
  }
`


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
`


const fbo_v_shader = `
    attribute vec3 aPosition;  //顶点位置
    attribute vec2 aTexCoor;    //顶点纹理坐标
    varying vec2 vTextureCoord;
    // 调试
    uniform float a_Test;
    attribute float a_Value;
    void main(){    
        if(a_Value > 0.0) {
            // gl_Position = vec4(aPosition, 1); //根据总变换矩阵计算此次绘制此顶点位置
            // gl_Position = vec4(aPosition, 150); //根据总变换矩阵计算此次绘制此顶点位置
            if(aPosition.z == 0.0) {
                 gl_Position = vec4(aPosition.x + a_Test, aPosition.y, aPosition.z, 150); 
            }
            gl_PointSize = 2.0;
            vTextureCoord = aTexCoor;
           
        }                       
    }  
`

const fbo_f_shader = `
    precision mediump float;
    uniform sampler2D sTexture;//纹理内容数据
    uniform bool isImg;
    uniform bool v_Test;
    varying vec2 vTextureCoord;
    void main(){
      if(!isImg){
        // gl_FragColor = vec4(0.2,0.8,0.1,1.0);
      }else{
        gl_FragColor = texture2D(sTexture, vTextureCoord).bgra;
      }
    }
`

export interface IDoseRenderConfig {
    // 横断面 ｜ 冠状面 ｜ 矢状面
    face?: 'transversal' | 'coronal' | 'sagittal'
    el: HTMLElement | null
    vertexData?: Float32Array
    // todo color Table 相关配置
    colorTable?: any[]
    v_shader?: string
    f_shader?: string
    width?: number
    height?: number
}

export interface IDoseInfo {
    nrVoxels: number[]
}

/**
 * 初始化
 */
class InitConfig {
    el: any
    // 横断面 ｜ 冠状面 ｜ 矢状面
    face: 'transversal' | 'coronal' | 'sagittal' = 'transversal'
    v_shader = v_shader
    f_shader = f_shader
    vertexData = new Float32Array()
    width: number = 512
    height: number = 512
    doseInfo: IDoseInfo = {
        // todo mock data
        nrVoxels: [183, 198, 150]
    }

    constructor(config?: IDoseRenderConfig) {
        return Object.assign(this, config)
    }

}

export class DoseRender {


    private _config: InitConfig


    constructor(config: IDoseRenderConfig) {

        if (!config.el) throw 'Please Choose HTML Element'

        this._config = new InitConfig(config)
        const {el, vertexData, face} = this._config
        this._el = el as HTMLElement
        this._vertexData = vertexData
        this._face = face
        console.log(this._config)

        // 初始化数据创建上下文

        this._canvas = document.createElement('canvas')
        // todo 添加 webgl1 和 webgl2 的配置(兼容性)
        this._gl = this._canvas.getContext("webgl2", {preserveDrawingBuffer: true}) as WebGL2RenderingContext | WebGLRenderingContext

    }

    // 相关配置如下
    private _gl: WebGL2RenderingContext | WebGLRenderingContext
    // 离屏canvas
    private _canvas: HTMLCanvasElement = document.createElement('canvas')
    // 展示canvas
    private _showCanvas: HTMLCanvasElement = document.createElement('canvas')
    private _el: HTMLElement

    get canvas(): HTMLCanvasElement {
        return this._showCanvas
    }


    // 顶点数据
    private _vertexData = new Float32Array()
    set vertexData(vertexData: Float32Array) {
        if (!vertexData.length) throw 'vertexData length is empty'
        this.loadVertex(vertexData)
        this._vertexData = vertexData
    }

    get vertexData() {
        // todo 重新渲染
        return this._vertexData
    }


    private drawLine() {
        // todo 画等剂量线
    }

    private _matrix = new Mat4()
    // 横断面 ｜ 冠状面 ｜ 矢状面

    // 默认横断面
    private _face: 'transversal' | 'coronal' | 'sagittal' = 'transversal'
    public set face(face: 'transversal' | 'coronal' | 'sagittal') {
        // todo init shader
        this._face = face
    }

    public get face(): 'transversal' | 'coronal' | 'sagittal' {
        return this._face
    }


    private _page: number = 0
    public set page(num: number) {
        this._page = num
    }

    public get page(): number {
        return this._page
    }


    // 创建上下文
    private createGl(width = 512, height = 512) {
        const {_canvas: canvas, _showCanvas: showCanvas, _gl: gl, _el: el} = this
        const dpr = window.devicePixelRatio || 1
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        canvas.width = dpr * width
        canvas.height = dpr * height
        gl.viewport(0, 0, canvas.width, canvas.height)


        showCanvas.style.width = `${width}px`
        showCanvas.style.height = `${height}px`
        showCanvas.width = dpr * width
        showCanvas.height = dpr * height

        el.append(canvas)

        // canvas.onmousedown = function (ev: any) {
        //     console.log(ev)
        //     let x = ev.clientX, y = ev.clientY;
        //     let rect = ev.target.getBoundingClientRect();
        //     console.log(rect)
        //     if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        //         let x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
        //         console.log(x_in_canvas, y_in_canvas)
        //     }
        // }

        return gl
    }

    public clear() {
        this._el.removeChild(this._el.children[0]);
    }

    private _drawProgram: WebGLProgram | undefined
    private _frameProgram: WebGLProgram | undefined
    private _program: WebGLProgram | undefined
    private _fbo: any

    // todo 渲染逻辑如下
    private init() {
        // todo 配置宽高
        this.createGl()
        const {v_shader, f_shader} = this._config

        //初始化两个着色器，drawProgram绘制到界面，frameProgram绘制到帧缓存
        // const drawProgram = this._drawProgram = createProgram(this._gl, v_shader_draw, f_shader_draw)
        // const frameProgram = this._frameProgram = createProgram(this._gl, v_shader, f_shader)


        this._program = initShaders(this._gl, v_shader, f_shader)
        // if (!drawProgram || !frameProgram) throw 'what`s wrong with me?'
        // //从着色器中获取地址，保存到对应的变量中
        // GetProgramLocation(this._gl, drawProgram, frameProgram);
        // // 初始化帧缓冲区对象 (FBO)
        // const fbo = this._fbo = initFramebufferObject(this._gl);
        // if (!fbo) {
        //     console.log('Failed to intialize the framebuffer object (FBO)');
        //     return false;
        // }
        // const {_gl: gl} = this
        // // 开启深度测试
        // gl.enable(gl.DEPTH_TEST);
        //
        // // 指定清空<canvas>的颜色
        // gl.clearColor(0.0, 0.0, 0.0, 1.0);
        //
        // //清空颜色和深度缓冲区
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    }

    private loadVertex(vertexData: Float32Array) {
        const {
            _gl: gl,
            _matrix: matrix,
            _program: program,
            _face: face,
            _page: page,
        } = this
        const buffer = DoseRender.initVertexBuffer(gl, vertexData)
        const FSIZE: number = vertexData.BYTES_PER_ELEMENT
        setAttributeFromBuffer(gl, 'a_Position', 3, FSIZE * 4, 0)
        setAttributeFromBuffer(gl, 'a_Value', 1, FSIZE * 4, FSIZE * 3)
    }

    /**
     * todo 绘制纹理
     */
    public drawTexture() {
        this.createGl()
        const {_gl: gl} = this
        const {v_shader, f_shader} = this._config

        const program = initShaders(gl, fbo_v_shader, fbo_f_shader)
        gl.enable(gl.DEPTH_TEST);

        let framebuffer: any = null
        let texture: any = null


        initFramebufferObject(gl);



        const vertexData = this._vertexData
        // const vertexData= new Float32Array([0.5,0.0,0.0,
        //     0.0,0.0,0.0,
        //     0.0,0.5,0.0])
        const vcount = vertexData.length / 3;					//得到顶点数量

        /**************缓冲相关**************/


        //创建顶点坐标数据缓冲
        const vertexBuffer = gl.createBuffer();
        //绑定顶点坐标数据缓冲
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        //将顶点坐标数据送入缓冲
        gl.bufferData(gl.ARRAY_BUFFER,vertexData,gl.STATIC_DRAW)


        //接收顶点纹理坐标数据
        const vertexTexCoor = [0.0, 1.0, 1.0, 1.0, 1.0, 0.0];

        //创建顶点纹理坐标缓冲
        const vertexTexCoorBuffer = gl.createBuffer();
        //将顶点纹理坐标数据送入缓冲
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTexCoor), gl.STATIC_DRAW);




        //设置纹理
        gl.uniform1i(gl.getUniformLocation(program, "sTexture"), 0);

        //绘制物体的方法
        const drawSelf = (ms: any, tex: any) => {
            //指定使用某套着色器程序
            gl.useProgram(program);
            //获取总变换矩阵引用id
            // var uMVPMatrixHandle=gl.getUniformLocation(program, "uMVPMatrix");
            //将总变换矩阵送入渲染管线
            // gl.uniformMatrix4fv(uMVPMatrixHandle,false,new Float32Array(ms.getFinalMatrix()));
            // 启用顶点坐标数据数组
            gl.enableVertexAttribArray(gl.getAttribLocation(program, "aPosition"));
            gl.enableVertexAttribArray(gl.getAttribLocation(program, "a_Value"));


            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);	//绑定顶点坐标数据缓冲

            // 3, FSIZE * 4, 0
            //给管线指定顶点坐标数据
            // gl.vertexAttribPointer(gl.getAttribLocation(program,"aPosition"),3, gl.FLOAT,false,0, 0);
            // todo 真实数据
            const FSIZE: number = vertexData.BYTES_PER_ELEMENT
            gl.vertexAttribPointer(gl.getAttribLocation(program,"aPosition"),3, gl.FLOAT,false,FSIZE * 4, 0);
            gl.vertexAttribPointer(gl.getAttribLocation(program,"a_Value"),1, gl.FLOAT,false,FSIZE * 4, FSIZE * 3);

            //启用纹理坐标数据
            gl.enableVertexAttribArray(gl.getAttribLocation(program, "aTexCoor"));
            //将顶点纹理坐标数据送入渲染管线
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoorBuffer);
            gl.vertexAttribPointer(gl.getAttribLocation(program, "aTexCoor"), 2, gl.FLOAT, false, 0, 0);			//一定要每次都取消绑定，在这里卡了很久
            var isImg = gl.getUniformLocation(program, 'isImg');
            var a_Test = gl.getUniformLocation(program, 'a_Test');
            var v_Test = gl.getUniformLocation(program, 'v_Test');
            if(tex){
                // gl.activeTexture(gl.TEXTURE0);
                // @ts-ignore
                gl.uniform1i(isImg, true);
                gl.uniform1f(a_Test, 100);
            }else{
                // @ts-ignore
                gl.uniform1i(isImg, false);
                gl.uniform1f(a_Test, 30);


            }



            // console.log('----------------- run this ------------------')
            // console.log(vertexData, vcount)
            // console.log(vertexData)
            // console.log('----------------- run this ------------------')
            //一定要每次都取消绑定，在这里卡了很久

            // gl.drawArrays(gl.TRIANGLES, 0, vcount);		//用顶点法绘制物体
            gl.drawArrays(gl.POINTS, 0, vertexData.length/ 4);		//用顶点法绘制物体

            //
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);


        }

        const drawFrame = () => {
            // 在帧缓冲区的颜色关联对象即纹理对象中绘制立方体，纹理使用图片
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);// 绑定帧缓冲区对象后绘制就会在绑定帧缓冲区中进行绘制




            gl.clearColor(0, 0.2, 0.4, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.viewport(0, 0, 512, 512);
            //
            drawSelf(null, false);

            // // 在canvas上绘制矩形，纹理使用上一步在纹理对象中绘制的图像
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);// 接触绑定之后，会在默认的颜色缓冲区中绘制
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.viewport(0, 0, 512, 512);
            // gl.viewport(0, 0, 512, 512);
            // //背景颜色_黑色
            // gl.clearColor(0.0, 0.0, 0.0, 1.0);
            //
            // //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            drawSelf(null, true);

        }
        drawFrame()


        function initFramebufferObject(gl: any) {
            framebuffer = gl.createFramebuffer();

            // 新建纹理对象作为帧缓冲区的颜色缓冲区对象
            texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // 新建渲染缓冲区对象作为帧缓冲区的深度缓冲区对象
            var depthBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

            // 检测帧缓冲区对象的配置状态是否成功
            var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            if (gl.FRAMEBUFFER_COMPLETE !== e) {
                console.log('Frame buffer object is incomplete: ' + e.toString());
                return;
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }

    }


    // 绘制入口
    public draw(page?: number) {
        // todo 测试，从init 中拿出来了，之后放回去
        this.init()
        this._vertexData?.length && this.loadVertex(this._vertexData)
        // todo 测试，从init 中拿出来了，之后放回去
        // todo 先默认画点
        page && (this.page = page)
        this.drawPoint()
    }

    // todo 画点
    private drawPoint() {
        const {
            _gl: gl,
            _vertexData: vertexData,
            _matrix: matrix,
            _program: program,
            _face: face,
            _page: page,
        } = this
        const {nrVoxels} = this._config.doseInfo
        if (!nrVoxels.length) throw 'doseInfo is wrong'
        console.log(this._config.doseInfo)
        let nrVoxel = 0.0
        console.log(nrVoxels)

        console.log(face)
        let faceNum = 0.0
        switch (face) {
            case "transversal":
                this._matrix.setRotate(0, 0, 1, 0)
                faceNum = 1.0
                nrVoxel = nrVoxels[2]
                break
            case "coronal":
                this._matrix.setRotate(90, 1, 0, 0)
                nrVoxel = nrVoxels[0]
                faceNum = 2.0
                break
            case "sagittal":
                this._matrix.setRotate(90, 0, -1, 0)
                nrVoxel = nrVoxels[1]
                faceNum = 3.0
                break
        }
        console.log(page)
        // matrix.lookAt(0, 0, 0, 0, -1, 0, 1, 0, 0)
        // matrix.ortho(-1, 1, -1, 1, -1, 1)
        matrix.scale(2, 2, 2)
        const a_Slice = gl.getUniformLocation(program as WebGLProgram, 'a_Slice')
        const a_Page = gl.getUniformLocation(program as WebGLProgram, 'a_Page')
        const a_Face = gl.getUniformLocation(program as WebGLProgram, 'a_Face')

        gl.uniform1f(a_Slice, nrVoxel)
        gl.uniform1f(a_Page, page)
        gl.uniform1f(a_Face, faceNum)


        const u_xformMatrix = gl.getUniformLocation(program as WebGLProgram, 'u_Matrix')
        gl.uniformMatrix4fv(u_xformMatrix, false, matrix.elements)

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, vertexData.length / 4)


        this._canvas.onmousedown = (ev: any) => {

            const {nrVoxels} = this._config.doseInfo
            if (!nrVoxels.length) return
            if (this.face === 'transversal') {
                // todo 换算坐标

            }
            // console.log(ev)
            let x = ev.clientX, y = ev.clientY;
            let rect = ev.target.getBoundingClientRect();

            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
                let x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
                let pixels = new Uint8Array(4);
                gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                // todo 获取 rgb 转换为 value
                console.log(pixels[0], pixels[1], pixels[2], pixels[3])


            }
        }
    }


    // 初始化buffer数据
    static initVertexBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext, vertices: Float32Array) {
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        return buffer
    }

    static setAttributeFromBuffer(gl: any, name: any, size = 2, stride = 0, offset = 0) {
        const attribute: GLint = gl.getAttribLocation(gl.program, name)
        gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, stride, offset)
        gl.enableVertexAttribArray(attribute)
    }
}

