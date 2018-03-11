// --------------------------------------------------
function ImageTransform() {}

// --------------------------------------------------
ImageTransform.GrayScale = function(inputImageData, outputImageData)
{
    Assert.NotNull(inputImageData);
    Assert.NotNull(outputImageData);

    for (var y = 0; y < inputImageData.height; y++)
    {
        for (var x = 0; x < inputImageData.width; x++)
        {
            var pixel = ImageDataUtils.GetPixel(inputImageData, x, y);
            pixel = pixel.GetGrayScale();
            ImageDataUtils.SetPixel(outputImageData, x, y, pixel);
        }
    }
};

// --------------------------------------------------
ImageTransform.Mirror = function(inputImageData, outputImageData)
{
    Assert.NotNull(inputImageData);
    Assert.NotNull(outputImageData);

    var width = inputImageData.width;
    for (var y = 0; y < inputImageData.height; y++)
    {
        for (var x = 0; x < width; x++)
        {
            var pixel = ImageDataUtils.GetPixel(inputImageData, x, y);
            ImageDataUtils.SetPixel(outputImageData, width - x, y, pixel);
        }
    }
};

// --------------------------------------------------
ImageTransform.InvertColors = function(inputImageData, outputImageData)
{
    Assert.NotNull(inputImageData);
    Assert.NotNull(outputImageData);

    for (var y = 0; y < inputImageData.height; y++)
    {
        for (var x = 0; x < inputImageData.width; x++)
        {
            var pixel = ImageDataUtils.GetPixel(inputImageData, x, y);
            ImageDataUtils.SetPixel(outputImageData, x, y, pixel.GetInverse());
        }
    }
};

// --------------------------------------------------
ImageTransform.SetBrightness = function(inputImageData, outputImageData, brightness)
{
    Assert.NotNull(inputImageData);
    Assert.NotNull(outputImageData);
    Assert.Number(brightness);

    // clamp [0..2]
    brightness = (brightness < 0.0) ? 0.0 : ((brightness > 2.0) ? 2.0 : brightness);

    for (var y = 0; y < inputImageData.height; y++)
    {
        for (var x = 0; x < inputImageData.width; x++)
        {
            var pixel = ImageDataUtils.GetPixel(inputImageData, x, y);
            var hsl = pixel.ToHSL();
            hsl.l = (hsl.l * brightness);
            ImageDataUtils.SetPixel(outputImageData, x, y, hsl.To_sRGB());
        }
    }
};

// --------------------------------------------------
ImageTransform.SetContrast = function(inputImageData, outputImageData, contrast)
{
    Assert.NotNull(inputImageData);
    Assert.NotNull(outputImageData);
    Assert.Number(contrast);

    // clamp [0..2]
    contrast = (contrast < 0.0) ? 0.0 : ((contrast > 2.0) ? 2.0 : contrast);

    for (var y = 0; y < inputImageData.height; y++)
    {
        for (var x = 0; x < inputImageData.width; x++)
        {
            var pixel = ImageDataUtils.GetPixel(inputImageData, x, y);
            pixel.DivideSelf(255.0);
            pixel.SubtractSelf(0.5);
            pixel.MultiplySelf(contrast);
            pixel.SumSelf(0.5);
            pixel.MultiplySelf(255.0);
            pixel.ClampSelf(0.0, 255.0);
            ImageDataUtils.SetPixel(outputImageData, x, y, pixel);
        }
    }
};