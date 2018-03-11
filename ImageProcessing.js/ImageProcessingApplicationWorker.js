self.addEventListener("message", function(e)
{
    importScripts("stacktrace.js", "System.js", "Collections.js", "ImageDataUtils.js", "Color.js", "ComplexNumber.js", "ImageTransform.js", "FourierTransform.js", "ImageBinarization.js");

    var arg0 = e.data;
    var operation = arg0.operation;
    var extraArgs = arg0.extraArgs;
    var inputImageData = arg0.inputImageData;
    var outputImageData = arg0.outputImageData;

    var start = System.Now();

    if (operation == "showFourierTransformModule")
    {
        var fourierTransform = new FourierTransform();
        fourierTransform.Compute(inputImageData);
        fourierTransform.DrawModule(outputImageData);
    }
    else if (operation == "showFourierTransformPhase")
    {
        var fourierTransform = new FourierTransform();
        fourierTransform.Compute(inputImageData);
        fourierTransform.DrawPhase(outputImageData);
    }
    else if (operation == "applyFourierLowPassFilter")
    {
        var filterRadius = extraArgs[0];

        var fourierTransform = new FourierTransform();
        fourierTransform.Compute(inputImageData);
        fourierTransform.ApplyLowPassFilter(filterRadius);
        fourierTransform.Invert();
        fourierTransform.DrawModule(outputImageData);
    }
    else if (operation == "applyFourierHighPassFilter")
    {
        var filterRadius = extraArgs[0];

        var fourierTransform = new FourierTransform();
        fourierTransform.Compute(inputImageData);
        fourierTransform.ApplyHighPassFilter(filterRadius);
        fourierTransform.Invert();
        fourierTransform.DrawModule(outputImageData);
    }
    else if (operation == "runOtsusMethod")
    {
        ImageBinarization.Otsu(inputImageData, outputImageData);
    }

    var end = System.Now();
    var elapsedTime = (end - start) / 1000.0;

    self.postMessage({ operation: operation, outputImageData: outputImageData, elapsedTime: elapsedTime });
}, false);