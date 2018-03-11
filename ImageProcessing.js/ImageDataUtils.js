
// --------------------------------------------------
//                  IMAGE DATA UTILS
// --------------------------------------------------

ImageDataUtils = function() {};

ImageDataUtils.GetPixel = function(imageData, x, y)
{
    Assert.NotNull(imageData);
    Assert.GreaterThan(x, -1);
    Assert.GreaterThan(y, -1);

    var i = y * imageData.width * 4 + (x * 4);
    return new sRGB(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]);
};

ImageDataUtils.SetPixel = function(imageData, x, y, pixel)
{
    Assert.NotNull(imageData);
    Assert.GreaterThan(x, -1);
    Assert.GreaterThan(y, -1);
    Assert.NotNull(pixel);

    var i = y * imageData.width * 4 + (x * 4);
    imageData.data[i] = pixel.r;
    imageData.data[i + 1] = pixel.g;
    imageData.data[i + 2] = pixel.b;
    imageData.data[i + 3] = 255.0;
};

ImageDataUtils.Copy = function(srcImageData, dstImageData)
{
    var size = srcImageData.width * srcImageData.height * 4;
    for (var i = 0; i < size; i++)
    {
        dstImageData.data[i] = srcImageData.data[i];
    }
};

ImageDataUtils.GetLuminanceHistogram = function(imageData, maxSamples)
{
    var luminanceHistogram = [];
    var weight = maxSamples / 256.0;

    for (var i = 0; i < maxSamples; i++)
    {
        luminanceHistogram.push({ luminance: 0, frequency: 0 });
    }

    var c = 0;
    for (var y = 0; y < imageData.height; y++)
    {
        for (var x = 0; x < imageData.width; x++)
        {
            var pixel = ImageDataUtils.GetPixel(imageData, x, y);
            var luminance = parseInt(pixel.GetLuminance() * weight);
            var data = luminanceHistogram[luminance];
            data.luminance = luminance;
            data.frequency++;
        }
    }

    return luminanceHistogram;
};

ImageDataUtils.Shift = function(imageData, tmpImageData)
{
    var halfWidth = Math.floor(imageData.width / 2);
    var halfHeight = Math.floor(imageData.height / 2);

    Assert.Equals(tmpImageData.width, imageData.width + halfWidth);
    Assert.Equals(tmpImageData.height, imageData.width + halfHeight);

    for (var i = 0; i < imageData.width; i++)
    {
        for (var j = 0; j < imageData.height; j++)
        {
            var pixel = ImageDataUtils.GetPixel(imageData, i, j);
            ImageDataUtils.SetPixel(tmpImageData, i, j, pixel);
        }
    }

    for (var i = 0; i < imageData.height; i++)
    {
        for (var j = 0; j < halfWidth; j++)
        {
            var pixel = ImageDataUtils.GetPixel(tmpImageData, j, i);
            ImageDataUtils.SetPixel(tmpImageData, j + imageData.width, i, pixel);
        }
    }

    for (var i = 0; i < imageData.height; i++)
    {
        for (var j = 0; j < imageData.width; j++)
        {
            var pixel = ImageDataUtils.GetPixel(tmpImageData, j + halfWidth, i);
            ImageDataUtils.SetPixel(tmpImageData, j, i, pixel);
        }
    }

    for (var i = 0; i < imageData.width; i++)
    {
        for (var j = 0; j < halfHeight; j++)
        {
            var pixel = ImageDataUtils.GetPixel(tmpImageData, i, j);
            ImageDataUtils.SetPixel(tmpImageData, i, j + imageData.height, pixel);
        }
    }

    for (var i = 0; i < imageData.width; i++)
    {
        for (var j = 0; j < imageData.height; j++)
        {
            var pixel = ImageDataUtils.GetPixel(tmpImageData, i, j + halfHeight);
            ImageDataUtils.SetPixel(tmpImageData, i, j, pixel);
        }
    }

    for (var i = 0; i < imageData.width; i++)
    {
        for (var j = 0; j < imageData.height; j++)
        {
            var pixel = ImageDataUtils.GetPixel(tmpImageData, i, j);
            ImageDataUtils.SetPixel(imageData, i, j, pixel);
        }
    }
};

ImageDataUtils.ApplyGammaCorrection = function(imageData, gamma)
{
    Assert.NotNull(imageData);
    Assert.Number(gamma);

    var _gamma = 1.0 / gamma;
    for (var x = 0; x < imageData.width; x++)
    {
        for (var y = 0; y < imageData.height; y++)
        {
            var pixel = ImageDataUtils.GetPixel(imageData, x, y);
            var red = Math.pow(pixel.r, _gamma);
            var green = Math.pow(pixel.g, _gamma);
            var blue = Math.pow(pixel.b, _gamma);
            var pixel = new sRGB(red * 255.0, green * 255.0, blue * 255.0);
            ImageDataUtils.SetPixel(imageData, x, y, pixel);
        }
    }
};
