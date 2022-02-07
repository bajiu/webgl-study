// 接口获取dose数据
import axios from 'axios';
import {DoseRender} from "../src/dose/DoseRender";

export const getDoseData = async() => {
  const { data } = await axios.get('http://localhost:8989/public/dose7.json');
  const {
    doseData,
    corner,
    nrVoxels,
    voxelSize
  } = data;

  const xLen = nrVoxels[0];
  const yLen = nrVoxels[1];
  const zLen = nrVoxels[2];
  // console.log(xLen, yLen, zLen);
  // 基准变量
  const baseX = +(1 / xLen).toFixed(3);
  const baseY = +(1 / yLen).toFixed(3);
  const baseZ = 1 / zLen;
  // console.log(baseX, baseY, baseX + (1 / zLen));
// 遍历有值的顶点, 制作三维模型数据
  const vertexArr: number[] = [];
  // console.log(doseData.length);
  // console.log('length X: ', xLen * baseY);
  // console.log('length Y: ', yLen * baseY);
  // console.log('length Z: ', zLen * baseY);
  doseData.forEach((value: any, index: number) => {
    // if (index > xLen * yLen + 1 && index <= xLen * yLen + 10) {
    //   console.log((index % xLen) * baseX,
    //     // (~~(index / xLen) % (xLen * yLen)) * baseY,
    //     ~~((index % (xLen * yLen)) / xLen) * baseY,
    //     ~~(index / (xLen * yLen)) * baseZ,
    //     value,);
    // }

    // 体数据
    vertexArr.push(
      ((index % xLen) - (xLen /2) - 0.5),
      // (~~(index / xLen) % (xLen * yLen)) * baseY,
      (~~((index % (xLen * yLen)) / xLen) - (yLen /2) ),
      (~~(index / (xLen * yLen)) - (zLen /2)) ,
      value,
    );


    // // 体数据
    // vertexArr.push(
    //   (index % xLen) * baseX,
    //   // (~~(index / xLen) % (xLen * yLen)) * baseY,
    //   ~~((index % (xLen * yLen)) / xLen) * baseY,
    //   ~~(index / (xLen * yLen)) * baseZ,
    //   value,
    // );
  });
  // console.log(vertexArr);
  return vertexArr;


}
