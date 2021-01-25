import ImageMagickHelper from './ImageMagickHelper';
const s3Util = require('./s3-util')
const path = require('path');
const os = require('os');

const BUCKET_NAME = '<bucket name>';
const OUTPUT_FOLDER = 'images';
const OUTPUT_IMAGE_TYPE = 'png';

export const handler = async (event: any = {}, context: any = {}) => {
	console.log('Picture Processor');

	try {
		const inputImage = {
			Bucket: BUCKET_NAME,
			Key: event.inputImage
		};
		
		const borderImage = {
			Bucket: BUCKET_NAME,
			Key: event.borderImage
		};

		const id = context.awsRequestId;
		const workdir = os.tmpdir();
		const inputImageFile = path.join(workdir, id + '-input' + path.extname(inputImage.Key));
		const borderImageFile = path.join(workdir, id + '-border' + path.extname(borderImage.Key));
		const outputImageFile = path.join(workdir, id + `-output.${OUTPUT_IMAGE_TYPE}`);

		const outputImage = {
			Bucket: BUCKET_NAME,
            Key: `${OUTPUT_FOLDER}/${id}-output.png`
		};

		console.log('1) Downloading input image');
		await s3Util.downloadFileFromS3(inputImage.Bucket, inputImage.Key, inputImageFile)
		
		console.log('2) Downloading border image');
		await s3Util.downloadFileFromS3(borderImage.Bucket, borderImage.Key, borderImageFile);

		console.log('3) Adding border image to input image');
		const output = await ImageMagickHelper.addBorder(inputImageFile, borderImageFile, outputImageFile);
						
		console.log(`4) Uploading ${output}`);
		await s3Util.uploadFileToS3(outputImage.Bucket, outputImage.Key, output, `image/${OUTPUT_IMAGE_TYPE}`);

		// resize image
		//ImageMagickHelper.resizeImage(event.inputImage, 900, 600, 'Silver', 'Center', event.resizedImage);

		// get image size
		// const imageSize = await ImageMagickHelper.getImageSize(event.border_1800_x_1200);
		// console.log(`Width: ${imageSize.width} Height: ${imageSize.height}`);
	}
	catch (error) {
        console.log(error);
    }
}


// TODO:
// 1) resize incoming image
// 2) create a front-end - upload image to S3
// 3) sam cli - test locally

// https://docs.aws.amazon.com/apigateway/latest/developerguide/integrating-api-with-aws-services-s3.html
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html