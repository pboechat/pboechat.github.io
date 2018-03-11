ImageFilterMask = function(masks, columns, rows)
{
    this.__masks = masks;
    this.__columns = columns;
    this.__rows = rows;

    this.GetColumns = function()
    {
        return this.__columns;
    }

    this.GetRows = function()
    {
        return this.__rows;
    }

    this.GetMaskElement = function(i, x, y)
    {
        return this.__masks[i][y * this.__columns + x];
    }
};

// --------------------------------------------------
function ImageFilter() {}

// --------------------------------------------------
ImageFilter.GAUSSIAN_MASK = new ImageFilterMask([[1 ,2, 1,
                                        2, 4, 2,
                                        1, 2, 1]],
    3, 3);

// --------------------------------------------------
ImageFilter.MEDIAN_MASK = new ImageFilterMask([[1, 1, 1,
                                      1, 1, 1,
                                      1, 1, 1]],
    3, 3);


// --------------------------------------------------
ImageFilter.LAPLACIAN_MASK = new ImageFilterMask([[ 0, -1,  0,
                                         -1,  4, -1,
                                          0, -1,  0],
                                        [-1, -1, -1,
                                         -1,  8, -1,
                                         -1, -1, -1]],
    3, 3);

// --------------------------------------------------
ImageFilter.SOBEL_MASK = new ImageFilterMask([[-1, 0, 1,
                                     -2, 0, 2,
                                     -1, 0, 1],
                                    [-1, -2, -1,
                                      0,  0,  0,
                                      1,  2,  1]],
    3, 3);

// --------------------------------------------------
ImageFilter.PREWITT_MASK = new ImageFilterMask([[-1, 0, 1,
                                       -1, 0, 1,
                                       -1, 0, 1],
                                       [ 1,  1,  1,
                                         0,  0,  0,
                                        -1, -1, -1]],
    3, 3);

// --------------------------------------------------
ImageFilter.FindHighestRGBA = function(imageData)
{
    Assert.NotNull(imageData);

    var highestRGBA = new sRGB(0, 0, 0, 0);
    for (var y = 0; y < imageData.height; y++)
    {
        for (var x = 0; x < imageData.width; x++)
        {
            highestRGBA.MaxSelf(ImageDataUtils.GetPixel(imageData, x, y));
        }
    }
    return highestRGBA;
};

// --------------------------------------------------
ImageFilter.ApplyLowPassFilter = function(filterMask, inputImageData, outputImageData, ignoreBorder)
{
    Assert.NotNull(filterMask);
    Assert.NotNull(inputImageData);
    Assert.NotNull(outputImageData);

    var k = 0;
    for(var i = 0; i < filterMask.GetRows(); i++)
    {
        for(var j = 0; j < filterMask.GetColumns(); j++)
        {
            var mask;
            if ((mask = filterMask.GetMaskElement(0, j, i)) >= 0)
            {
                k += mask;
            }
        }
    }

    var n = ImageFilter.FindHighestRGBA(inputImageData);
    n.DivideSelf(255.0);
    var halfColumns = Math.floor(filterMask.GetColumns() / 2);
    var halfRows = Math.floor(filterMask.GetRows() / 2);

    var minimumX;
    var minimumY;
    minimumX = minimumY = (ignoreBorder) ? 1 : 0;
    var maximumX = inputImageData.width - ((ignoreBorder) ? 1 : 0);
    var maximumY = inputImageData.height - ((ignoreBorder) ? 1 : 0);

    for (var y = 0; y < inputImageData.height; y++)
    {
        for (var x = 0; x < inputImageData.width; x++)
        {
            var color = new sRGB();

            for (var row = 0; row < filterMask.GetRows(); row++)
            {
                for (var column = 0; column < filterMask.GetColumns(); column++)
                {
                    var readX = x + column - halfColumns;
                    var readY = y + row - halfRows;

                    if (readX < minimumX || readY < minimumY || readX >= maximumX || readY >= maximumY)
                    {
                        continue;
                    }

                    var pixel = ImageDataUtils.GetPixel(inputImageData, readX, readY);
                    pixel.MultiplySelf(filterMask.GetMaskElement(0, column, row));
                    color.SumSelf(pixel);
                }
            }

            color.DivideSelf(k);
            color.MultiplySelf(n);
            color.ClampSelf(0, 255);
            ImageDataUtils.SetPixel(outputImageData, x, y, color);
        }
    }
};

// --------------------------------------------------
ImageFilter.ApplyHighPassFilter = function(filterMask, inputImageData, outputImageData)
{
    Assert.NotNull(filterMask);
    Assert.NotNull(inputImageData);
    Assert.NotNull(outputImageData);

    var n = ImageFilter.FindHighestRGBA(inputImageData);
    n.DivideSelf(255.0);

    var halfColumns = Math.floor(filterMask.GetColumns() / 2);
    var halfRows = Math.floor(filterMask.GetRows() / 2);

    for (var y = 0; y < inputImageData.height; y++)
    {
        for (var x = 0; x < inputImageData.width; x++)
        {
            var colorX = new sRGB();
            var colorY = new sRGB();

            for (var row = 0; row < filterMask.GetRows(); row++)
            {
                for (var column = 0; column < filterMask.GetColumns(); column++)
                {
                    var readX = x + column - halfColumns;
                    var readY = y + row - halfRows;

                    if (readX < 0 || readY < 0 || readX >= inputImageData.width || readY >= inputImageData.height)
                    {
                        continue;
                    }

                    var pixelX = ImageDataUtils.GetPixel(inputImageData, readX, readY);
                    pixelX.MultiplySelf(filterMask.GetMaskElement(0, column, row));
                    colorX.SumSelf(pixelX);

                    var pixelY = ImageDataUtils.GetPixel(inputImageData, readX, readY);
                    pixelY.MultiplySelf(filterMask.GetMaskElement(1, column, row));
                    colorY.SumSelf(pixelY);
                }

                var color = new sRGB(Math.sqrt(colorX.r * colorX.r + colorY.r * colorY.r),
                                      Math.sqrt(colorX.g * colorX.g + colorY.g * colorY.g),
                                      Math.sqrt(colorX.b * colorX.b + colorY.b * colorY.b),
                                      255);
                color.MultiplySelf(n);
                color.ClampSelf(0, 255);
                ImageDataUtils.SetPixel(outputImageData, x, y, color);
            }
        }
    }
};
