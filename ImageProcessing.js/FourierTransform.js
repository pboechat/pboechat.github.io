// --------------------------------------------------
FourierTransform = Object.SubClass();

// --------------------------------------------------
FourierTransform.prototype.__Constructor = function()
{
    this.__width = 0;
    this.__height = 0;
    this.__imageData = null;
    this.__fMatrix = null;
    this.__hMatrix = null;
    this.__wMatrix = null;
    this.__tMatrix = null;
};

// --------------------------------------------------
FourierTransform.prototype.__CreateMatrices = function()
{
    var size = this.__height * this.__width;
    this.__fMatrix = new Array(size);
    this.__tMatrix = new Array(size);
    this.__hMatrix = new Array(this.__height * this.__height);
    this.__wMatrix = new Array(this.__width * this.__width);

    for (var i = 0; i < size; i++)
    {
        this.__fMatrix[i] = new ComplexNumber();
        this.__tMatrix[i] = new ComplexNumber();
    }
};

// --------------------------------------------------
FourierTransform.prototype.__ComputeH = function()
{
    var c = new ComplexNumber(0.0, 1.0);
    var term2 = Math.sqrt(this.__height);
    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__height;
        var term1 = -2.0 * Math.PI * i;
        for (var j = 0; j < this.__height; j++)
        {
            var exponent = new ComplexNumber(term1 * j / this.__height);
            exponent.MultiplySelf(c);
            exponent.ExponentialSelf();
            this.__hMatrix[i1 + j] = exponent.Divide(term2);
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.__ComputeInverseH = function()
{
    var c = new ComplexNumber(0.0, 1.0);
    var term2 = Math.sqrt(this.__height);
    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__height;
        var term1 = 2.0 * Math.PI * i;
        for (var j = 0; j < this.__height; j++)
        {
            var exponent = new ComplexNumber(term1 * j / this.__height);
            exponent.MultiplySelf(c);
            exponent.ExponentialSelf();
            this.__hMatrix[i1 + j] = exponent.Divide(term2);
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.__ComputeW = function()
{
    var c = new ComplexNumber(0.0, 1.0);
    var term2 = Math.sqrt(this.__width);
    for (var i = 0; i < this.__width; i++)
    {
        var i1 = i * this.__width;
        var term1 = -2.0 * Math.PI * i;
        for (var j = 0; j < this.__width; j++)
        {
            var exponent = new ComplexNumber(term1 * j / this.__width);
            exponent.MultiplySelf(c);
            exponent.ExponentialSelf();
            this.__wMatrix[i1 + j] = exponent.Divide(term2);
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.__ComputeInverseW = function()
{
    var c = new ComplexNumber(0.0, 1.0);
    var term2 = Math.sqrt(this.__width);
    for (var i = 0; i < this.__width; i++)
    {
        var i1 = i * this.__width;
        var term1 = 2.0 * Math.PI * i;
        for (var j = 0; j < this.__width; j++)
        {
            var exponent = new ComplexNumber(term1 * j / this.__width);
            exponent.MultiplySelf(c);
            exponent.ExponentialSelf();
            this.__wMatrix[i1 + j] = exponent.Divide(term2);
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.__ComputeT = function(imageData)
{
    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__width;
        for (var j = 0; j < this.__width; j++)
        {
            for (var k = 0; k < this.__height; k++)
            {
                var pixel = ImageDataUtils.GetPixel(imageData, i, k);
                var aux1 = new ComplexNumber(pixel.r);
                var k1 = k * this.__height;
                var aux2 = this.__hMatrix[k1 + j].Multiply(aux1);
                this.__tMatrix[i1 + j].SumSelf(aux2);
            }
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.__ComputeInverseT = function(fMatrix)
{
    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__width;
        for (var j = 0; j < this.__width; j++)
        {
            for (var k = 0; k < this.__height; k++)
            {
                var k1 = k * this.__height;
                var aux = this.__hMatrix[k1 + j].Multiply(fMatrix[i1 + k]);
                this.__tMatrix[i1 + j].SumSelf(aux);
            }
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.__Shift = function()
{
    var halfWidth = Math.ceil(this.__width / 2);
    var width = this.__width + halfWidth;
    var halfHeight = Math.ceil(this.__height / 2);
    var height = this.__height + halfHeight;

    var fMatrix = new Array(width * height);

    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * width;
        var i2 = i * this.__width;
        for (var j = 0; j < this.__width; j++)
        {
            fMatrix[i1 + j] = this.__fMatrix[i2 + j];
        }
    }

    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * width;
        for (var j = 0; j < halfWidth; j++)
        {
            fMatrix[i1 + j + this.__width] = fMatrix[i1 + j];
        }
    }

    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * width;
        for (var j = 0; j < this.__width; j++)
        {
            fMatrix[i1 + j] = fMatrix[i1 + j + halfWidth];
        }
    }

    for (var i = 0; i < this.__width; i++)
    {
        for (var j = 0; j < halfHeight; j++)
        {
            fMatrix[(j + this.__height) * width + i] = fMatrix[j * width + i];
        }
    }

    for (var i = 0; i < this.__width; i++)
    {
        for (var j = 0; j < this.__height; j++)
        {
            fMatrix[j * width + i] = fMatrix[(j + halfHeight) * width + i];
        }
    }

    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * width;
        var i2 = i * this.__width;
        for (var j = 0; j < this.__width; j++)
        {
            this.__fMatrix[i2 + j] = fMatrix[i1 + j];
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.Compute = function(imageData)
{
    Assert.NotNull(imageData);

    ImageTransform.GrayScale(imageData, imageData);

    this.__width = imageData.width;
    this.__height = imageData.height;
    this.__imageData = imageData;

    this.__CreateMatrices();

    this.__ComputeH();
    this.__ComputeW();
    this.__ComputeT(imageData);

    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__width;
        for (var j = 0; j < this.__width; j++)
        {
            for (var k = 0; k < this.__height; k++)
            {
                var k1 = k * this.__width;
                this.__fMatrix[i1 + j].SumSelf(this.__wMatrix[i1 + k].Multiply(this.__tMatrix[k1 + j]));
            }
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.Invert = function()
{
    Assert.NotNull(this.__imageData);
    Assert.NotNull(this.__fMatrix);

    var size = this.__height * this.__width;
    var fMatrix = new Array(size);
    this.__tMatrix = new Array(size);

    for (var i = 0; i < size; i++)
    {
        fMatrix[i] = new ComplexNumber(this.__fMatrix[i]);
        this.__fMatrix[i] = new ComplexNumber();
        this.__tMatrix[i] = new ComplexNumber();
    }

    this.__ComputeInverseH();
    this.__ComputeInverseW();
    this.__ComputeInverseT(fMatrix);

    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__width;
        for (var j = 0; j < this.__width; j++)
        {
            for (var k = 0; k < this.__height; k++)
            {
                var k1 = k * this.__width;
                this.__fMatrix[i1 + j].SumSelf(this.__wMatrix[i1 + k].Multiply(this.__tMatrix[k1 + j]));
            }
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.__GetHighestNorm = function()
{
    var highestNorm = this.__fMatrix[0].Norm();
    for(var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__width;
        for(var j = 0; j < this.__width; j++)
        {
            var norm = this.__fMatrix[i1 + j].Norm();
            if (norm > highestNorm)
            {
                highestNorm = norm;
            }
        }
    }

    return highestNorm;
};

// --------------------------------------------------
FourierTransform.prototype.DrawModule = function(imageData)
{
    Assert.NotNull(imageData);
    Assert.Equals(this.__width, imageData.width);
    Assert.Equals(this.__height, imageData.height);

    this.__Shift();

    var highestNorm = this.__GetHighestNorm();
    for(var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__width;
        for(var j = 0; j < this.__width; j++)
        {
            var aux1 = 255.0 / Math.log(1 + highestNorm);
            var aux2 = Math.log(1 + this.__fMatrix[i1 + j].Norm());
            var norm = aux1 * aux2;
            var pixel = new sRGB(norm, norm, norm);
            ImageDataUtils.SetPixel(imageData, i, j, pixel);
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.DrawPhase = function(imageData)
{
    Assert.NotNull(imageData);
    Assert.Equals(this.__width, imageData.width);
    Assert.Equals(this.__height, imageData.height);

    this.__Shift();

    var highestNorm = this.__GetHighestNorm();
    for(var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__width;
        for(var j = 0; j < this.__width; j++)
        {
            var aux1 = 255.0 / Math.log(1 + highestNorm);
            var aux2 = Math.log(1 + this.__fMatrix[i1 + j].Argument());
            var norm = aux1 * aux2;
            var pixel = new sRGB(norm, norm, norm);
            ImageDataUtils.SetPixel(imageData, i, j, pixel);
        }
    }
};

// --------------------------------------------------
FourierTransform.prototype.ApplyLowPassFilter = function(radius)
{
    var size = this.__width * this.__height;
    var filterMask = new Array(size);

    var radius2 = Math.pow(radius, 2);
    var halfWidth = Math.ceil(this.__width / 2);
    var halfHeight = Math.ceil(this.__height / 2);
    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__width;
        var i2 = (i - halfWidth) * (i - halfWidth);
        for (var j = 0; j < this.__width; j++)
        {
            var j2 = (j - halfHeight) * (j - halfHeight);

            if (i2 + j2 <= radius2)
            {
                filterMask[i1 + j] = 1.0;
            }
            else
            {
                filterMask[i1 + j] = 0.0;
            }
        }
    }

    this.__Shift();
    for (var i = 0; i < this.__width; i ++)
    {
        var i1 = i * this.__width;
        for (var j = 0; j < this.__height; j++)
        {
            this.__fMatrix[i1 + j].MultiplySelf(filterMask[i1 + j]);
        }
    }
    this.__Shift();
};

// --------------------------------------------------
FourierTransform.prototype.ApplyHighPassFilter = function(radius)
{
    var size = this.__width * this.__height;
    var filterMask = new Array(size);

    var radius2 = Math.pow(radius, 2);
    var halfWidth = Math.ceil(this.__width / 2);
    var halfHeight = Math.ceil(this.__height / 2);
    for (var i = 0; i < this.__height; i++)
    {
        var i1 = i * this.__width;
        var i2 = (i - halfWidth) * (i - halfWidth);
        for (var j = 0; j < this.__width; j++)
        {
            var j2 = (j - halfHeight) * (j - halfHeight);

            if (i2 + j2 <= radius2)
            {
                filterMask[i1 + j] = 0.0;
            }
            else
            {
                filterMask[i1 + j] = 1.0;
            }
        }
    }

    this.__Shift();
    for (var i = 0; i < this.__width; i ++)
    {
        var i1 = i * this.__width;
        for (var j = 0; j < this.__height; j++)
        {
            this.__fMatrix[i1 + j].MultiplySelf(filterMask[i1 + j]);
        }
    }
    this.__Shift();
};