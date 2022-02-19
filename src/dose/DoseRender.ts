import {IDoseRenderConfig, InitConfig, IValidateParams, validateConfig, validateParams} from "./utils";
import {Mat4} from "cuon-matrix";
import {createProgram} from "../../lib/InitShaders";


const v_fbo = `#version 300 es
    in vec3 a_Position;
    in float a_Value;
    
    uniform mat4 u_Mat;
    uniform float a_Page;
    uniform float a_Face;
    
    out float u_Value;
    
    uniform float a_Max;
    uniform float a_Min;
    
    // float a_Page = 30.0;
    // float a_Face = 2.0;
    // float a_Min = 25.0; 
    // float a_Max = 30.0;
    
    
    
    void main () {
        // 只取中间的
        if(a_Value >= a_Min) {
            // todo 数据需要对齐
            // todo 先做成平面的，因为不同间距会有不同视距，这里确定了之后再做
            if(a_Position.z == a_Page && a_Face == 1.0) {
                // Z轴 为深度
                gl_Position = vec4(a_Position, 170.0) * u_Mat;
            } else if(a_Position.y == a_Page && a_Face == 2.0) {
                // Y轴 为深度
                gl_Position = vec4(a_Position, 170.0) * u_Mat;
            } else if(a_Position.x == a_Page && a_Face == 3.0) {
                gl_Position = vec4(a_Position, 170.0) * u_Mat;
            } 
            gl_PointSize = 3.5;
        }
        u_Value = a_Value;
    }
`
//
const f_fbo = `#version 300 es
    // 中精度够用
    precision mediump float;
    out vec4 outColor;
    // 是否为等计量线
    // uniform bool isLine;
    uniform vec4 u_Color;
    
    in float u_Value;
    void main(){
        // outColor = vec4(1.0,0.0,0.0,1.0);
        outColor = u_Color / 255.0;
    }
    
`


const v_draw = `#version 300 es
    in vec4 a_Position;
    in vec2 a_Texture;
    out vec2 v_Texture;
    void main() {
        gl_Position = a_Position;
        v_Texture = a_Texture;
        // gl_PointSize = 2.0;     
    }
`
const f_draw = `#version 300 es
    // 纹理内容数据
    precision mediump float;

    uniform sampler2D u_Sampler;
    in vec2 v_Texture;
    out vec4 outColor;
    uniform vec4 u_Diff_color;
    vec4 debug_color = vec4(1.0, 0.0, 1.0, 1.0);
    
    
    // 颜色配置最大长度
    const int colorTableLen = 10;
    uniform vec4 u_ColorTable[colorTableLen];
    
    
    
    const int len = 4; 
    // vec2 array[9] = vec2[9](
    //     vec2(-1,-1), vec2(0,-1), vec2( 1, 1), 
    //     vec2(-1, 0), vec2(0, 0), vec2( 1, 0),
    //     vec2(-1, 1), vec2(0, 1), vec2( 1, 1)
    // );
    vec2 array[4] = vec2[4](vec2(0,-1),vec2(-1, 0), vec2(1, 0),vec2(0, 1));
    
    
    void main() {
        vec2 pixel;
        bool isBoundary = false;
        vec4 color;
        vec4 diff_Color;
        
        vec4 currentColor; 
        // 默认背景色白色
        vec4 bgColor = vec4(0.0, 0.0, 0.0, 0.0);
        
        color = texture(u_Sampler, v_Texture);
        // currentColor = u_ColorTable[0];
        // if(color == currentColor) {
        //     diff_Color = color;
        // } else {
        //     diff_Color = vec4(0.0,0.0,0.0,0.0);
        // }
        // for(int i = 0; i < len; i++) {
        //     pixel = array[i] / 512.0;
        //     if(texture(u_Sampler, v_Texture + pixel) != currentColor && currentColor == color) {
        //         diff_Color = currentColor;
        //     }
        // }
        // diff_Color = texture(u_Sampler, v_Texture);
        // diff_Color = currentColor;
        
        color = texture(u_Sampler, v_Texture);  
        
        for(int j = 0; j < colorTableLen; j++) {
            currentColor = u_ColorTable[j];
            
            for(int i = 0; i < len; i++) {  
                // 上下左右的坐标
                pixel = array[i] / 512.0; 
                if(j == 0) {
                     // if(texture(u_Sampler, v_Texture + pixel) == bgColor && color != bgColor) {
                     //    diff_Color = currentColor;
                     // }
                      if(texture(u_Sampler, v_Texture + pixel) != currentColor && color == currentColor) {
                        diff_Color = currentColor;
                    }
                }
                // if( j == 1) {
                //     if(texture(u_Sampler, v_Texture + pixel) != currentColor && color == currentColor) {
                //         diff_Color = currentColor;
                //     }
                // }
                // if( j == 2) {
                //
                //     if(texture(u_Sampler, v_Texture + pixel) != currentColor && color == currentColor) {
                //         diff_Color = currentColor;
                //     }
                //
                // }
                // if(j == 1) {
                //     if(color != u_ColorTable[j] && texture(u_Sampler, v_Texture + pixel) == u_ColorTable[j]) {
                //         diff_Color = u_ColorTable[j];
                //     }
                //     // if( texture(u_Sampler, v_Texture + pixel) != u_ColorTable[j-1] && texture(u_Sampler, v_Texture + pixel) != currentColor && u_ColorTable[j-1] != color ) {
                //     //     diff_Color = currentColor;
                //     // }
                // }
                // if(texture(u_Sampler, v_Texture + pixel) != currentColor && currentColor == color) {
                //     diff_Color = currentColor;
                // }
            }
        
        
        }
        
        
        // for(int j = 0; j < colorTableLen; j++) {
        //     // todo 改为卷积, 这里二重循环有毒
        //     for(int i = 0; i < len; i++) {
        //         currentColor = u_ColorTable[j];
        //         // currentColor = vec4(0, 215, 255, 255) / 255.0;
        //         color = texture(u_Sampler, v_Texture);  
        //         pixel = array[i] / 512.0;
        //         if(texture(u_Sampler, v_Texture + pixel) != currentColor && currentColor == color) {
        //             diff_Color = currentColor;
        //         }
        //
        //         if(j == 0) {
        //              // if(texture(u_Sampler, v_Texture + pixel) == bgColor && color != bgColor) {
        //              //    diff_Color = currentColor;
        //              // }
        //         } else if(j == 1) {
        //             // diff_Color = currentColor;
        //             // if(currentColor != vec4(0.0,0.0,0.0,0.0)) {
        //             //     if(texture(u_Sampler, v_Texture + pixel) == currentColor && color != currentColor) {
        //             //         diff_Color = currentColor;
        //             //     }
        //             // }
        //
        //         }
        //     }
        //
        // }
        outColor = diff_Color;
        
        
        // if(isBoundary) {
        //     // outColor = u_Diff_color;
        //     // outColor = vec4(0.0, 0.0, 1.0, 1.0);
        //      outColor = diff_Color
        // }else {
        //     outColor = vec4(0.0, 0.0, 0.0, 0.0);
        // }
    }
`


enum EnumFace {
    null,
    'transversal',
    'coronal',
    'sagittal'
}

// todo 继承配置基类
export class DoseRender {
    private _config: InitConfig
    // 父元素 dom
    private _el: HTMLElement

    // 离屏canvas
    private _fboCanvas: HTMLCanvasElement = document.createElement('canvas')

    private _canvas: HTMLCanvasElement = document.createElement('canvas')
    // 为了防止后面出现增加需求导致的歧义, 所以这里用了两个 上下文没有用一个上下文做切换, 非常不建议改成一个上下文来回换切
    private _fboGl: WebGL2RenderingContext | WebGLRenderingContext
    private _drawGl: WebGL2RenderingContext | WebGLRenderingContext

    get canvas(): HTMLCanvasElement {
        return this._canvas
    }


    // 顶点数据, 只能看不能摸
    private _vertexData = new Float32Array()
    public get vertexData() {
        return this._vertexData
    }

    // 矢量数据
    private _matrix = new Mat4()
    // 横断面 ｜ 冠状面 ｜ 矢状面

    // 默认横断面
    private _face: 'transversal' | 'coronal' | 'sagittal' = 'transversal'
    public get face(): 'transversal' | 'coronal' | 'sagittal' {
        return this._face
    }

    @validateParams({arg: 'face', type: 'string', valueType: ['transversal', 'coronal', 'sagittal']} as IValidateParams)
    public setFace(side: 'transversal' | 'coronal' | 'sagittal') {
        this._face = side
        this.loadFbo()
    }

    public set face(side: 'transversal' | 'coronal' | 'sagittal') {
        this.setFace(side)
    }

    // 页数
    private _page: number = 0

    @validateParams({arg: 'num', type: "number"})
    public setPage(num: number) {
        this._page = num
        this.loadFbo()
    }

    public set page(num: number) {
        this.setPage(num)
    }

    public get page() {
        return this._page
    }

    _fboProgram: WebGLProgram;
    _drawProgram: WebGLProgram;


    constructor(config: IDoseRenderConfig) {
        if (!config.el) throw 'Please Choose HTML Element'
        this._config = new InitConfig(config)

        const {el, vertexData, face} = this._config
        this._el = el as HTMLElement
        this._vertexData = vertexData
        this._fboGl = this._fboCanvas.getContext("webgl2", {preserveDrawingBuffer: true}) as WebGL2RenderingContext | WebGLRenderingContext
        this._drawGl = this.canvas.getContext("webgl2", {preserveDrawingBuffer: true}) as WebGL2RenderingContext | WebGLRenderingContext
        this.setCanvasAttr()
        this._fboGl.viewport(0, 0, this.canvas.width, this.canvas.height)
        this._drawGl.viewport(0, 0, this.canvas.width, this.canvas.height)
        this._fboProgram = createProgram(this._fboGl, v_fbo, f_fbo)
        this._drawProgram = createProgram(this._drawGl, v_draw, f_draw)

    }

    width = 512
    height = 512


    // todo 调试方法
    initFboProgram() {
        const {_fboGl: gl, _fboProgram, face, _page: page, _matrix: matrix, vertexData} = this
        const {nrVoxels} = this._config.doseInfo
        const program = _fboProgram;
        gl.useProgram(_fboProgram)
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW)
        // this._gl.viewport(0, 0,512, 512)
        const FSIZE: number = vertexData.BYTES_PER_ELEMENT
        // 绑定顶点着色器
        const a_Position = gl.getAttribLocation(program, 'a_Position')
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 4, 0)
        gl.enableVertexAttribArray(a_Position)

        const a_Value = gl.getAttribLocation(program, 'a_Value')
        gl.vertexAttribPointer(a_Value, 1, gl.FLOAT, false, FSIZE * 4, FSIZE * 3)
        gl.enableVertexAttribArray(a_Value)

    }


    // todo 绘制离屏 canavs
    public loadFbo() {
        const {_fboGl: gl, _fboProgram, face, _page: page, _matrix: matrix, vertexData} = this
        const {nrVoxels} = this._config.doseInfo
        const program = _fboProgram;

        let nrVoxel = 0.0

        switch (face) {
            case "transversal":
                this._matrix.setRotate(0, 1, 0, 0)
                nrVoxel = nrVoxels[2]
                break
            case "coronal":
                this._matrix.setRotate(90, 1, 0, 0)
                nrVoxel = nrVoxels[0]
                break
            case "sagittal":
                this._matrix.setRotate(90, 0, -1, 0)
                nrVoxel = nrVoxels[1]
                break
        }

        matrix.scale(2, 2, 2)

        const a_Slice = gl.getUniformLocation(program as WebGLProgram, 'a_Slice')
        const a_Page = gl.getUniformLocation(program as WebGLProgram, 'a_Page')
        const a_Face = gl.getUniformLocation(program as WebGLProgram, 'a_Face')
        const a_Min = gl.getUniformLocation(program as WebGLProgram, 'a_Min')
        const a_Max = gl.getUniformLocation(program as WebGLProgram, 'a_Max')
        // float a_Min = 25.0;
        // float a_Max = 30.0;




        // todo 模拟数据
        // gl.uniform4fv( gl.getUniformLocation(program, "u_Color"), [0.0, 0.0, 255.0, 255.0])

        // gl.uniform1f(a_Slice, nrVoxel)
        gl.uniform1f(a_Page, page)
        gl.uniform1f(a_Face, EnumFace[face])

        const u_Mat = gl.getUniformLocation(program as WebGLProgram, 'u_Mat')
        gl.uniformMatrix4fv(u_Mat, false, matrix.elements)

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT)


        gl.drawArrays(gl.POINTS, 0, this._vertexData.length / 4)

        // gl.uniform1f(a_Min, 500.0)
        // gl.uniform1f(a_Max, 6600.0)
        // gl.uniform4fv(u_Color, [1.0, 0.0, 1.0, 1.0])
        // gl.drawArrays(gl.POINTS, 0, this._vertexData.length / 4)

        const {prescriptionValue, colorTable} = this._config
        let lastValue = 0.0;
        // todo interface
        this._config.colorTable.forEach((item,index:number) => {
            // if(index ==1) return
            // if(index === 0) {
                const nowValue = item.percent * prescriptionValue / 100;
                this.drawFbo(item.color, nowValue, lastValue)
                lastValue = nowValue
                // if(index == 0) {
                    let pixels = new Uint8Array(512 * 512 * 4)
                    gl.readPixels(0, 0, 512, 512, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    this._pixels = pixels
                    this.loadTexture()
                // }

            // }

        })

        console.log('lineBuffers:',this.lineBuffers)
        this.drawAllLine()

    }

    // todo interface
    private drawFbo(colors: any, nowValue: number, lastValue: number) {
        const {_fboGl: gl, _fboProgram: program, face, _page: page, _matrix: matrix, vertexData} = this
        // console.log(colors, nowValue, lastValue)
        // gl.uniform1f(a_Min, 0.01)
        // gl.uniform1f(a_Max, 500.0)
        gl.uniform1f(gl.getUniformLocation(program as WebGLProgram, 'a_Min'), nowValue)
        // gl.uniform1f(gl.getUniformLocation(program as WebGLProgram, 'a_Max'), nowValue)
        gl.uniform4fv(gl.getUniformLocation(program, "u_Color"), colors)

        gl.drawArrays(gl.POINTS, 0, this._vertexData.length / 4)
    }

    private _pixels: Uint8Array = new Uint8Array()

    // todo 加载相关纹理
    loadTexture() {
        const {_drawGl: gl} = this
        const program = this._drawProgram
        const texture = this.createTexture()
        gl.useProgram(program)


        const verticesTexture = new Float32Array([
            // 顶点坐标, 纹理坐标
            -1.0, 1.0, 0.0, 1.0,
            -1.0, -1.0, 0.0, 0.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, -1.0, 1.0, 0.0,
        ]);
        const FSIZE = verticesTexture.BYTES_PER_ELEMENT;
        //创建顶点坐标数据缓冲
        const vertexBuffer = gl.createBuffer();
        //绑定顶点坐标数据缓冲
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        //将顶点坐标数据送入缓冲
        gl.bufferData(gl.ARRAY_BUFFER, verticesTexture, gl.STATIC_DRAW)


        const a_Position = gl.getAttribLocation(program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.uniform1i(gl.getUniformLocation(program, "sTexture"), 0);

        // 将纹理坐标分配给 a_Texture 并开启
        const a_Texture = gl.getAttribLocation(program, 'a_Texture');
        gl.vertexAttribPointer(a_Texture, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
        gl.enableVertexAttribArray(a_Texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, this._pixels);

        // const u_Diff_color = gl.getUniformLocation(program, "u_Diff_color")

        // todo 模拟数据
        // gl.uniform4fv(u_Diff_color, [0.0, 0.0, 1.0, 1.0])

        // const arr = new Float32Array(10)
        // const colorTable = [
        //     0.0, 0.0, 255.0, 255.0,
        //     255.0, 0.0, 255.0, 255.0
        // ]

        const colorTable = [
            0/255, 0/255, 255/255, 255/255,
            // 0/255, 255/255, 0/255, 255/255,
            // 255/255, 0/255, 0/255, 255/255,
        ]

        // console.log('----', this._config.colorTable)
        const colorArr = [];
        for (const color of this._config.colorTable) {
            colorArr.push(...color.color)
        }
        // console.log(colorArr)

        const u_ColorTable = gl.getUniformLocation(program, "u_ColorTable")
        gl.uniform4fv(u_ColorTable, colorTable)


        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        let pixel = new Uint8Array(4)
        gl.readPixels(200, 256, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        // console.log('pixel',pixel)
        let pixels = new Uint8Array(512 * 512 * 4)
        gl.readPixels(0, 0, 512, 512, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        this.lineBuffers.push(pixels)


    }
    private lineBuffers:any = []

    private drawAllLine() {
        const lineCanvas = document.createElement('canvas')

        lineCanvas.width = 512
        lineCanvas.height = 512
        lineCanvas.style.width = `512px`
        lineCanvas.style.height = `512px`
        // lineCanvas.style.background = `orange`

        this._el.append(lineCanvas)

        const ctx: CanvasRenderingContext2D = lineCanvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = `rgba(255, 255, 255, 0)`
        // console.log()
        const imageBuffer = Uint8ClampedArray.from(this.lineBuffers[0])

        const imageData = new ImageData(imageBuffer,512, 512);
        console.log(imageData)
        console.time()
        for (const i in imageBuffer) {
            if(imageBuffer[i] == 0 && this.lineBuffers[1][i] != 0) {
                if(imageBuffer[i] != this.lineBuffers[1][i]) {
                    imageBuffer[i] = this.lineBuffers[1][i];
                }
            }

        }
        console.timeEnd()
        ctx.putImageData(imageData, 0, 0);


    }


    private createTexture(): WebGLTexture | null {
        const {_drawGl: gl, _pixels} = this
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, _pixels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // 检测帧缓冲区对象的配置状态是否成功
        const e: GLenum = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            console.log('Frame buffer object is incomplete: ' + e.toString());
            return null;
        }
        return texture;
    }


    public clear() {
        // todo 清除方法
    }

    // todo 修改为static
    private setCanvasAttr() {
        const {
            canvas,
            _fboCanvas: fboCanvas,
            width, height,
            _el
        } = this
        const dpr = window.devicePixelRatio || 1
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        canvas.width = dpr * width
        canvas.height = dpr * height

        _el.append(canvas)

        // 离屏canvas绘制尺寸
        fboCanvas.width = dpr * width
        fboCanvas.height = dpr * height
        fboCanvas.style.width = `${width}px`
        fboCanvas.style.height = `${height}px`


        // todo debug
        _el.append(fboCanvas)
        // fboCanvas.style.background = 'gary'
        // canvas.style.background = 'pink'
    }
}
