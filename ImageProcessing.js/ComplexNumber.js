// --------------------------------------------------
//                 COMPLEX NUMBER
// --------------------------------------------------
ComplexNumber = Object.SubClass();

// --------------------------------------------------
ComplexNumber.prototype.__Constructor = function(a, b)
{
    if (Type.IsUndefined(a))
    {
        this.a = 0.0;

        if (Type.IsUndefined(b))
        {
            this.b = 0.0;
        }
        else
        {
            Assert.Number(a);

            this.b = b;
        }
    }
    else
    {
        if (a instanceof ComplexNumber)
        {
            this.a = a.a;
            this.b = a.b;
        }
        else
        {
            Assert.Number(a);

            this.a = a;

            if (Type.IsUndefined(b))
            {
                this.b = 0.0;
            }
            else
            {
                Assert.Number(a);

                this.b = b;
            }
        }
    }
};

// --------------------------------------------------
ComplexNumber.prototype.Sum = function(element)
{
    if (element instanceof ComplexNumber)
    {
        Assert.NotNull(element);

        return new ComplexNumber(this.a + element.a, this.b + element.b);
    }
    else
    {
        Assert.Number(element);

        return new ComplexNumber(this.a + element, this.b);
    }
};

// --------------------------------------------------
ComplexNumber.prototype.SumSelf = function(element)
{
    if (element instanceof ComplexNumber)
    {
        Assert.NotNull(element);

        var a = this.a + element.a;
        var b = this.b + element.b;

        this.a = a;
        this.b = b;
    }
    else
    {
        Assert.Number(element);

        this.a += element;
    }

    return this;
};

// --------------------------------------------------
ComplexNumber.prototype.Subtract = function(element)
{
    if (element instanceof ComplexNumber)
    {
        Assert.NotNull(element);

        return new ComplexNumber(this.a - element.a, this.b - element.b);
    }
    else
    {
        Assert.Number(element);

        return new ComplexNumber(this.a - element, this.b);
    }
};

// --------------------------------------------------
ComplexNumber.prototype.SubtractSelf = function(element)
{
    if (element instanceof ComplexNumber)
    {
        Assert.NotNull(element);

        var a = this.a - element.a;
        var b = this.b - element.b;

        this.a = a;
        this.b = b;
    }
    else
    {
        Assert.Number(element);

        this.a -= element;
    }

    return this;
};

// --------------------------------------------------
ComplexNumber.prototype.Multiply = function(element)
{
    if (element instanceof ComplexNumber)
    {
        Assert.NotNull(element);

        var a = (this.a * element.a) - (this.b * element.b);
        var b = (this.a * element.b) + (element.a * this.b);

        return new ComplexNumber(a, b);
    }
    else
    {
        Assert.Number(element);

        return new ComplexNumber(this.a * element, this.b * element);
    }
};

// --------------------------------------------------
ComplexNumber.prototype.MultiplySelf = function(element)
{
    if (element instanceof ComplexNumber)
    {
        Assert.NotNull(element);

        var a = (this.a * element.a) - (this.b * element.b);
        var b = (this.a * element.b) + (element.a * this.b);

        this.a = a;
        this.b = b;
    }
    else
    {
        Assert.Number(element);

        this.a *= element;
        this.b *= element;
    }

    return this;
};

// --------------------------------------------------
ComplexNumber.prototype.Divide = function(element)
{
    if (element instanceof ComplexNumber)
    {
        Assert.NotNull(element);

        var denominator = Math.pow(element.a, 2) + Math.pow(element.b, 2);
        var a = ((this.a * element.a) + (this.b * element.b)) / denominator;
        var b = ((element.a * this.b) - (this.a * element.b)) / denominator;

        return new ComplexNumber(a, b);
    }
    else
    {
        Assert.Number(element);

        return new ComplexNumber(this.a / element, this.b / element);
    }
};

// --------------------------------------------------
ComplexNumber.prototype.DivideSelf = function(element)
{
    if (element instanceof ComplexNumber)
    {
        Assert.NotNull(element);

        var denominator = Math.pow(element.a, 2) + Math.pow(element.b, 2);

        var a = ((this.a * element.a) + (this.b * element.b)) / denominator;
        var b = ((element.a * this.b) - (this.a * element.b)) / denominator;

        this.a = a;
        this.b = b;
    }
    else
    {
        Assert.Number(element);

        this.a /= element;
        this.b /= element;
    }

    return this;
};

// --------------------------------------------------
ComplexNumber.prototype.Exponential = function()
{
    var term1 = Math.pow(Math.E, this.a);
    var a = term1 * Math.cos(this.b);
    var b = term1 * Math.sin(this.b);
    return new ComplexNumber(a, b);
};

// --------------------------------------------------
ComplexNumber.prototype.ExponentialSelf = function()
{
    var term1 = Math.pow(Math.E, this.a);
    var a = term1 * Math.cos(this.b);
    var b = term1 * Math.sin(this.b);
    this.a = a;
    this.b = b;

    return this;
};

// --------------------------------------------------
ComplexNumber.prototype.Conjugate = function()
{
    return new ComplexNumber(this.a, -this.b);
};

// --------------------------------------------------
ComplexNumber.prototype.Norm = function()
{
    return Math.pow(this.a, 2) + Math.pow(this.b, 2);
};

// --------------------------------------------------
ComplexNumber.prototype.Argument = function()
{
    return Math.atan(this.a / this.b)
};

// --------------------------------------------------
ComplexNumber.prototype.Equals = function(other)
{
    if (Type.IsUndefined(other) || other == null)
    {
        return false;
    }

    if (!(other instanceof ComplexNumber))
    {
        return false;
    }

    return this.a == other.a && this.b == other.b;
};

// --------------------------------------------------
ComplexNumber.prototype.ToString = function()
{
    return "(" + this.a + ", " + this.b + ")";
};

// --------------------------------------------------
//            COMPLEX NUMBER TEST CASES
// --------------------------------------------------

UnitTest.AddTestCase("ComplexNumber.js", "basic_complex_number_x_scalar_arithmetic_operations", function()
{
    var c1 = new ComplexNumber(1.0, 1.0);

    Assert.Equals(c1.Sum(1.0), new ComplexNumber(2.0, 1.0));
    Assert.Equals(c1.Subtract(1.0), new ComplexNumber(0.0, 1.0));
    Assert.Equals(c1.Multiply(2.0), new ComplexNumber(2.0, 2.0));
    Assert.Equals(c1.Divide(2.0), new ComplexNumber(0.5, 0.5));

    Assert.Equals(new ComplexNumber(1.0, 1.0).SumSelf(1.0), new ComplexNumber(2.0, 1.0));
    Assert.Equals(new ComplexNumber(1.0, 1.0).SubtractSelf(1.0), new ComplexNumber(0.0, 1.0));
    Assert.Equals(new ComplexNumber(1.0, 1.0).MultiplySelf(2.0), new ComplexNumber(2.0, 2.0));
    Assert.Equals(new ComplexNumber(1.0, 1.0).DivideSelf(2.0), new ComplexNumber(0.5, 0.5));
});

// --------------------------------------------------
UnitTest.AddTestCase("ComplexNumber.js", "basic_complex_number_x_complex_number_arithmetic_operations", function()
{
    var c1 = new ComplexNumber(1.0, 1.0);
    var c2 = new ComplexNumber(2.0, 2.0);

    Assert.Equals(c1.Sum(c2), new ComplexNumber(3.0, 3.0));
    Assert.Equals(c1.Subtract(c2), new ComplexNumber(-1.0, -1.0));
    Assert.Equals(c1.Multiply(c2), new ComplexNumber(0.0, 4.0));
    Assert.Equals(c1.Divide(c2), new ComplexNumber(0.5, 0.0));

    var c1 = new ComplexNumber(1.0, 1.0);
    Assert.Equals(c1.SumSelf(c1), new ComplexNumber(2.0, 2.0));
    var c1 = new ComplexNumber(1.0, 1.0);
    Assert.Equals(c1.SubtractSelf(c1), new ComplexNumber(0.0, 0.0));
    var c1 = new ComplexNumber(1.0, 1.0);
    Assert.Equals(c1.MultiplySelf(c1), new ComplexNumber(0.0, 2.0));
    var c1 = new ComplexNumber(1.0, 1.0);
    Assert.Equals(c1.DivideSelf(c1), new ComplexNumber(1.0, 0.0));

    Assert.Equals(new ComplexNumber(1.0, 1.0).SumSelf(c2), new ComplexNumber(3.0, 3.0));
    Assert.Equals(new ComplexNumber(1.0, 1.0).SubtractSelf(c2), new ComplexNumber(-1.0, -1.0));
    Assert.Equals(new ComplexNumber(1.0, 1.0).MultiplySelf(c2), new ComplexNumber(0.0, 4.0));
    Assert.Equals(new ComplexNumber(1.0, 1.0).DivideSelf(c2), new ComplexNumber(0.5, 0.0));
});

// --------------------------------------------------
UnitTest.AddTestCase("ComplexNumber.js", "basic_complex_number_unary_operations", function()
{
    var c1 = new ComplexNumber(1.0, 1.0);
    var c2 = new ComplexNumber(2.0, 2.0);

    Assert.Equals(c1.Exponential(), new ComplexNumber(1.4686939399158851, 2.2873552871788423));
    Assert.Equals(c2.Exponential(), new ComplexNumber(-3.0749323206393586, 6.718849697428249));
    Assert.Equals(new ComplexNumber(1.0, 1.0).ExponentialSelf(), new ComplexNumber(1.4686939399158851, 2.2873552871788423));
    Assert.Equals(new ComplexNumber(2.0, 2.0).ExponentialSelf(), new ComplexNumber(-3.0749323206393586, 6.718849697428249));
});

// --------------------------------------------------
UnitTest.AddTestCase("ComplexNumber.js", "basic_complex_number_norm", function()
{
    var c1 = new ComplexNumber(1.0, 1.0);
    var c2 = new ComplexNumber(2.0, 2.0);

    Assert.Equals(c1.Norm(), 2.0);
    Assert.Equals(c2.Norm(), 8.0);
});
