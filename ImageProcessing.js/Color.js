// --------------------------------------------------
//                     COLORS
// --------------------------------------------------

// --------------------------------------------------
//                     sRGB
// --------------------------------------------------

sRGB = Object.SubClass();

// --------------------------------------------------
sRGB.prototype.__Constructor = function(r, g, b)
{
    this.r = (Type.IsUndefined(r)) ? 0.0 : r;
    this.g = (Type.IsUndefined(g)) ? 0.0 : g;
    this.b = (Type.IsUndefined(b)) ? 0.0 : b;
};

// --------------------------------------------------
sRGB.prototype.Sum = function(element)
{
    if (element instanceof sRGB)
    {
        Assert.NotNull(element);

        return new sRGB(this.r + element.r, this.g + element.g, this.b + element.b);
    }
    else
    {
        Assert.Number(element);

        return new sRGB(this.r + element, this.g + element, this.b + element);
    }
};

// --------------------------------------------------
sRGB.prototype.SumSelf = function(element)
{
    if (element instanceof sRGB)
    {
        Assert.NotNull(element);

        this.r += element.r;
        this.g += element.g;
        this.b += element.b;
    }
    else
    {
        Assert.Number(element);

        this.r += element;
        this.g += element;
        this.b += element;
    }

    return this;
};

// --------------------------------------------------
sRGB.prototype.Subtract = function(element)
{
    if (element instanceof sRGB)
    {
        Assert.NotNull(element);

        return new sRGB(this.r - element.r, this.g - element.g, this.b - element.b);
    }
    else
    {
        Assert.Number(element);

        return new sRGB(this.r - element, this.g - element, this.b - element);
    }
};

// --------------------------------------------------
sRGB.prototype.SubtractSelf = function(element)
{
    if (element instanceof sRGB)
    {
        Assert.NotNull(element);

        this.r -= element.r;
        this.g -= element.g;
        this.b -= element.b;
    }
    else
    {
        Assert.Number(element);

        this.r -= element;
        this.g -= element;
        this.b -= element;
    }

    return this;
};

// --------------------------------------------------
sRGB.prototype.Multiply = function(element)
{
    if (element instanceof sRGB)
    {
        Assert.NotNull(element);

        return new sRGB(this.r * element.r, this.g * element.g, this.b * element.b);
    }
    else
    {
        Assert.Number(element);

        return new sRGB(this.r * element, this.g * element, this.b * element);
    }
};

// --------------------------------------------------
sRGB.prototype.MultiplySelf = function(element)
{
    if (element instanceof sRGB)
    {
        Assert.NotNull(element);

        this.r *= element.r;
        this.g *= element.g;
        this.b *= element.b;
    }
    else
    {
        Assert.Number(element);

        this.r *= element;
        this.g *= element;
        this.b *= element;
    }

    return this;
};

// --------------------------------------------------
sRGB.prototype.Divide = function(element)
{
    if (element instanceof sRGB)
    {
        Assert.NotNull(element);

        return new sRGB(this.r / element.r, this.g / element.g, this.b / element.b);
    }
    else
    {
        Assert.Number(element);

        return new sRGB(this.r / element, this.g / element, this.b / element);
    }
};

// --------------------------------------------------
sRGB.prototype.DivideSelf = function(element)
{
    if (element instanceof sRGB)
    {
        Assert.NotNull(element);

        this.r /= element.r;
        this.g /= element.g;
        this.b /= element.b;
    }
    else
    {
        Assert.Number(element);

        this.r /= element;
        this.g /= element;
        this.b /= element;
    }

    return this;
};

// --------------------------------------------------
sRGB.prototype.Max = function(color)
{
    Assert.NotNull(color);

    return new sRGB(Math.max(this.r, color.r), Math.max(this.g, color.g), Math.max(this.b, color.b));
};

// --------------------------------------------------
sRGB.prototype.MaxSelf = function(color)
{
    Assert.NotNull(color);

    this.r = Math.max(this.r, color.r);
    this.g = Math.max(this.g, color.g);
    this.b = Math.max(this.b, color.b);

    return this;
};

// --------------------------------------------------
sRGB.prototype.ClampSelf = function(min, max)
{
    Assert.Number(min);
    Assert.Number(max);

    this.r = (this.r < min) ? min : this.r;
    this.r = (this.r > max) ? max : this.r;

    this.g = (this.g < min) ? min : this.g;
    this.g = (this.g > max) ? max : this.g;

    this.b = (this.b < min) ? min : this.b;
    this.b = (this.b > max) ? max : this.b;
};

// --------------------------------------------------
sRGB.prototype.GetLuminance = function()
{
    var linearColor = sRGB.GammaExpansion(this);
    return (0.2126 * linearColor.r + 0.7152 * linearColor.g + 0.0722 * linearColor.b);
};

// --------------------------------------------------
sRGB.prototype.GetGrayScale = function()
{
    var luminance = this.GetLuminance();
    return new sRGB(luminance, luminance, luminance);
};

// --------------------------------------------------
sRGB.prototype.GetInverse = function()
{
    var inverseColor = new sRGB();
    inverseColor.r = 255.0 - this.r;
    inverseColor.g = 255.0 - this.g;
    inverseColor.b = 255.0 - this.b;
    return inverseColor;
};

// --------------------------------------------------
sRGB.prototype.ToHSL = function()
{
    var rgb = this.Divide(255.0);
    var v;
    var m;
    var vm;
    var r2, g2, b2;

    var h = 0;
    var s = 0;
    var l = 0;

    v = Math.max(Math.max(rgb.r, rgb.g), rgb.b);
    m = Math.min(Math.min(rgb.r, rgb.g), rgb.b);

    l = (m + v) / 2.0;

    if (l <= 0.0)
    {
        return new HSL(h, s, l);
    }

    vm = v - m;
    s = vm;
    if (s > 0.0)
    {
        s /= (l <= 0.5) ? (v + m) : (2.0 - v - m) ;
    }
    else
    {
        return new HSL(h, s, l);
    }

    r2 = (v - rgb.r) / vm;
    g2 = (v - rgb.g) / vm;
    b2 = (v - rgb.b) / vm;

    if (rgb.r == v)
    {
        h = (rgb.g == m ? 5.0 + b2 : 1.0 - g2);
    }
    else if (rgb.g == v)
    {
        h = (rgb.b == m ? 1.0 + r2 : 3.0 - b2);
    }
    else
    {
        h = (rgb.r == m ? 3.0 + g2 : 5.0 - r2);
    }
    h /= 6.0;

    return new HSL(h, s, l);
};


// --------------------------------------------------
sRGB.prototype.Equals = function(other)
{
    if (Type.IsUndefined(other) || other == null)
    {
        return false;
    }

    if (!(other instanceof sRGB))
    {
        return false;
    }

    return this.r == other.r && this.g == other.g && this.b == other.b;
};

// --------------------------------------------------
sRGB.prototype.ToString = function()
{
    return "(" + this.r + ", " + this.g + ", " + this.b + ")";
};

// --------------------------------------------------
//                      HSL
// --------------------------------------------------
function HSL(h, s, l)
{
    this.h = (Type.IsUndefined(h)) ? 0 : h;
    this.s = (Type.IsUndefined(s)) ? 0 : s;
    this.l = (Type.IsUndefined(l)) ? 0 : l;

    this.To_sRGB = function()
    {
        var v;
        var r;
        var g
        var b;
        var h = this.h;

        r = this.l;   // default to gray
        g = this.l;
        b = this.l;
        v = (this.l <= 0.5) ? (this.l * (1.0 + this.s)) : (this.l + this.s - this.l * this.s);

        if (v > 0)
        {
            var m;
            var sv;
            var sextant;
            var fract;
            var vsf;
            var mid1;
            var mid2;

            m = this.l + this.l - v;
            sv = (v - m) / v;
            h *= 6.0;
            sextant = parseInt(h);
            fract = h - sextant;
            vsf = v * sv * fract;
            mid1 = m + vsf;
            mid2 = v - vsf;
            switch (sextant)
            {
                case 0:
                    r = v;
                    g = mid1;
                    b = m;
                    break;
                case 1:
                    r = mid2;
                    g = v;
                    b = m;
                    break;
                case 2:
                    r = m;
                    g = v;
                    b = mid1;
                    break;
                case 3:
                    r = m;
                    g = mid2;
                    b = v;
                    break;
                case 4:
                    r = mid1;
                    g = m;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = m;
                    b = mid2;
                    break;
            }
        }

        var rgb = new sRGB();
        rgb.r = (r * 255.0);
        rgb.g = (g * 255.0);
        rgb.b = (b * 255.0);

        return rgb;
    }
}

sRGB.GammaExpansion = function(color)
{
    var newColor = new sRGB(color.r, color.g, color.b);
    newColor.DivideSelf(255.0);
    if (newColor.r <= 0.04045)
    {
        newColor.r /= 12.92;
    }
    else
    {
        newColor.r = Math.pow((newColor.r + 0.055) / 1.055, 2.4);
    }

    if (newColor.g <= 0.04045)
    {
        newColor.g /= 12.92;
    }
    else
    {
        newColor.g = Math.pow((newColor.g + 0.055) / 1.055, 2.4);
    }

    if (newColor.b <= 0.04045)
    {
        newColor.b /= 12.92;
    }
    else
    {
        newColor.b = Math.pow((newColor.b + 0.055) / 1.055, 2.4);
    }
    newColor.MultiplySelf(255.0);

    return newColor;
};

// --------------------------------------------------
//                  COLOR TEST CASES
// --------------------------------------------------

UnitTest.AddTestCase("Color.js", "basic_sRGB_x_scalar_arithmetic_operations", function()
{
    var c1 = new sRGB(1.0, 1.0, 1.0);

    Assert.Equals(c1.Sum(127.0), new sRGB(128.0, 128.0, 128.0));
    Assert.Equals(c1.Subtract(127.0), new sRGB(-126.0, -126.0, -126.0));
    Assert.Equals(c1.Multiply(10.0), new sRGB(10.0, 10.0, 10.0));
    Assert.Equals(c1.Divide(2.0), new sRGB(0.5, 0.5, 0.5));

    Assert.Equals(new sRGB(1.0, 1.0, 1.0).SumSelf(127.0), new sRGB(128.0, 128.0, 128.0));
    Assert.Equals(new sRGB(1.0, 1.0, 1.0).SubtractSelf(127.0), new sRGB(-126.0, -126.0, -126.0));
    Assert.Equals(new sRGB(1.0, 1.0, 1.0).MultiplySelf(10.0), new sRGB(10.0, 10.0, 10.0));
    Assert.Equals(new sRGB(1.0, 1.0, 1.0).DivideSelf(2.0), new sRGB(0.5, 0.5, 0.5));
});

UnitTest.AddTestCase("Color.js", "basic_sRGB_x_sRGB_arithmetic_operations", function()
{
    var c1 = new sRGB(1.0, 1.0, 1.0);
    var c2 = new sRGB(128.0, 128.0, 128.0);

    Assert.Equals(c1.Sum(c2), new sRGB(129.0, 129.0, 129.0));
    Assert.Equals(c1.Subtract(c2), new sRGB(-127.0, -127.0, -127.0));
    Assert.Equals(c1.Multiply(c2), new sRGB(128.0, 128.0, 128.0));
    Assert.Equals(c1.Divide(c2), new sRGB(0.0078125, 0.0078125, 0.0078125));

    var c1 = new sRGB(1.0, 1.0, 1.0);
    Assert.Equals(c1.SumSelf(c2), new sRGB(129.0, 129.0, 129.0));
    var c1 = new sRGB(1.0, 1.0, 1.0);
    Assert.Equals(c1.SubtractSelf(c2), new sRGB(-127.0, -127.0, -127.0));
    var c1 = new sRGB(1.0, 1.0, 1.0);
    Assert.Equals(c1.MultiplySelf(c2), new sRGB(128.0, 128.0, 128.0));
    var c1 = new sRGB(1.0, 1.0, 1.0);
    Assert.Equals(c1.DivideSelf(c2), new sRGB(0.0078125, 0.0078125, 0.0078125));

    Assert.Equals(new sRGB(1.0, 1.0, 1.0).SumSelf(c2), new sRGB(129.0, 129.0, 129.0));
    Assert.Equals(new sRGB(1.0, 1.0, 1.0).SubtractSelf(c2), new sRGB(-127.0, -127.0, -127.0));
    Assert.Equals(new sRGB(1.0, 1.0, 1.0).MultiplySelf(c2), new sRGB(128.0, 128.0, 128.0));
    Assert.Equals(new sRGB(1.0, 1.0, 1.0).DivideSelf(c2), new sRGB(0.0078125, 0.0078125, 0.0078125));
});