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
export class InitConfig {
    el: any
    // 横断面 ｜ 冠状面 ｜ 矢状面
    face: 'transversal' | 'coronal' | 'sagittal' = 'transversal'
    v_shader = ``
    f_shader = ``
    vertexData = new Float32Array()
    width: number = 512
    height: number = 512
    doseInfo: IDoseInfo = {
        // todo mock data
        nrVoxels: [183, 198, 150]
    }
    // 处方计量
    prescriptionValue: number = 0;
    // todo interface
    colorTable: any[] = [];

    constructor(config?: IDoseRenderConfig) {
        return Object.assign(this, config)
    }

}

export interface IValidateParams {
    arg: any;
    type: 'number' | 'string' | 'boolean' | 'undefined' | 'object';
    valueType?: any[];
}

// todo 暂时只用到了单参数, 未来添加多类型判断
export const validateParams = (params: IValidateParams) => {
    const {arg, type, valueType} = params
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const fn = descriptor.value;
        descriptor.value = function (args: any) {
            if(args === undefined || args == null) throw `咱们就是说这个该传  ${arg}  这个参数没有传`
            // todo 这里有隐式转换问题
            if(typeof args !== type) throw `咱们就是说这个 ${arg} 这个参数的类型多少不是那么对'`;
            if(valueType?.length) {
                const index = valueType.findIndex(i => i == args)
                if(index === -1) throw `咱们就是说这个  ${arg}  这个参数的数值多少不是那么对`;
            }
            fn.apply(this, [args])
        }
    }
}

export const validateConfig = (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    // todo 验证入参, 整理剔除无用参数, 支持的 webgl 版本确认, 模式代理, 日志抛出, 初始化问题抛出
    return descriptor

}
