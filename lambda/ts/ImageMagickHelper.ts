import IM = require('imagemagick');
import Size from './Size';

export default class ImageMagickHelper {
    constructor() { }

    static async getImageSize(inputImage: string): Promise<Size> {
        return new Promise<Size>((resolve, reject) => {
            IM.identify(inputImage, function(err, features) {
                if (err) reject('Unable to get image size');
                
                const size = new Size(0, 0);
                size.width = features['width'] ? features['width'] : 0;
                size.height = features['height'] ? features['height'] : 0;
                
                resolve(size);
            });
        });
    }

    static resizeImage(inputImage: string, desiredWidth: number, desizedHeight: number, backgroundColor: string, gravity: string, outputImage: string): void {
        const options = {
            srcPath: inputImage,
            dstPath: outputImage,
            width: desiredWidth,
            height: desizedHeight
        };

        IM.resize(options, (err, result) => {
            if (err) throw err;
            console.log(`Resized ${inputImage}`);
        });
    }

    static async addBorder(inputImage: string, borderImage: string, outputImage: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            IM.convert([inputImage, borderImage, '-geometry', '+0+0', '-composite', outputImage], 
                (err, stdout) =>  {
                    if (err) throw err;
                    console.log(`Added border to image.  Output: ${outputImage}`);
                    resolve(outputImage);
                });
        });
    }
}