// --------------------------------------------------
function ImageBinarization() {}

// --------------------------------------------------
ImageBinarization.Threshold = function(inputImageData, outputImageData, threshold)
{
    Assert.NotNull(inputImageData);
    Assert.NotNull(outputImageData);
    Assert.Number(threshold);

    for (var y = 0; y < inputImageData.height; y++)
    {
        for (var x = 0; x < inputImageData.width; x++)
        {
            var pixel = ImageDataUtils.GetPixel(inputImageData, x, y);
            var luminance = pixel.GetLuminance();
            if (luminance >= threshold)
            {
                pixel = new sRGB(255.0, 255.0, 255.0);
            }
            else
            {
                pixel = new sRGB(0.0, 0.0, 0.0);
            }
            ImageDataUtils.SetPixel(outputImageData, x, y, pixel);
        }
    }
};

// --------------------------------------------------
ImageBinarization.Otsu = function(inputImageData, outputImageData)
{
    Assert.NotNull(inputImageData);
    Assert.NotNull(outputImageData);

    var histogram = ImageDataUtils.GetLuminanceHistogram(inputImageData, 256);

    var maximumFrequency = inputImageData.width * inputImageData.height;
    var backgroundWeight;
    var foregroundWeight;
    var backgroundFrequenciesSum;
    var backgroundWeightedFrequenciesSum;
    var foregroundFrequenciesSum;
    var foregroundWeightedFrequenciesSum;
    var backgroundMean;
    var foregroundMean;
    var betweenClassVariance;
    var maximumBetweenClassVariance = Number.MIN_VALUE;
    var threshold = -1;
    var frequency;

    for (var i = 0; i < 256; i++)
    {
        backgroundWeight = 0;
        backgroundWeightedFrequenciesSum = 0;
        backgroundFrequenciesSum = 0;
        for (var j = 0; j < i; j++)
        {
            frequency = histogram[j].frequency;
            backgroundWeight += frequency;
            backgroundWeightedFrequenciesSum += j * frequency;
            backgroundFrequenciesSum += frequency;
        }
        backgroundWeight /= maximumFrequency;
        backgroundMean = (backgroundFrequenciesSum == 0) ? 0 : backgroundWeightedFrequenciesSum / backgroundFrequenciesSum;

        foregroundWeight =  0;
        foregroundWeightedFrequenciesSum = 0;
        foregroundFrequenciesSum = 0;
        for (var j = i; j < 256; j++)
        {
            frequency = histogram[j].frequency;
            foregroundWeight += frequency;
            foregroundWeightedFrequenciesSum += j * frequency;
            foregroundFrequenciesSum += frequency;
        }
        foregroundWeight /= maximumFrequency;
        foregroundMean = (foregroundFrequenciesSum == 0) ? 0 : foregroundWeightedFrequenciesSum / foregroundFrequenciesSum;

        betweenClassVariance = backgroundWeight * foregroundWeight * Math.pow(backgroundMean - foregroundMean, 2);

        if (betweenClassVariance > maximumBetweenClassVariance)
        {
            threshold = i;
            maximumBetweenClassVariance = betweenClassVariance;
        }
    }

    if (threshold == -1)
    {
        // FIXME: checking invariants
        throw("threshold == -1");
    }

    ImageBinarization.Threshold(inputImageData, outputImageData, threshold);
}