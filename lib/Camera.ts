import {Vec3, Mat4} from "cuon-matrix";


export class Camera {
    constructor() {
        this.position = new Vec3()

        this.up = new Vec3(0, 1, 0)
        this.viewMatrix = new Mat4()
    }

    // 上方向
    private up: Vec3;
    // 相机位置
    public position: Vec3;

    private viewMatrix: Mat4;

    public lookAt(target: any) {
        const {x, y, z} = this.position
        this.viewMatrix.lookAt(this.position.x, this.position.y, this.position.z, target.x, target.y, target.z, this.up.x, this.up.y, this.up.z)
    }
}
