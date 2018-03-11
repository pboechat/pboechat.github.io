var DEFAULT_CANVAS_WIDTH = 32;
var DEFAULT_CANVAS_HEIGHT = 32;
var IMAGES = [  { name: "Lena", src: "img/lena.jpg" },
                { name: "Lena (Small)", src: "img/lena-small.png" },
                { name: "Clown", src: "img/clown.jpg" },
                { name: "Butterfly", src: "img/butterfly.png" },
                { name: "Multicolored", src: "img/multicolored.jpg" },
                { name: "Vertical Stripes", src: "img/vertical-stripes.png" },
                { name: "Rectangle", src: "img/rectangle.png" },
                { name: "Rectangle (45º)", src: "img/rectangle-45.png" },
                { name: "Rectangle (45º, off)", src: "img/rectangle-45-off.png" },
                { name: "Circle (Small)", src: "img/circle-small.png" },
                { name: "Circle", src: "img/circle.png" },
                { name: "Gauss (Small)", src: "img/gauss-small.png" },
                { name: "Gauss", src: "img/gauss.png" },
                { name: "Grid", src: "img/grid.png" },
                { name: "Lena (White Noise)", src: "img/lena-white-noise.jpg" },
                { name: "Lena (Salt 'n Pepper)", src: "img/lena-salt-and-pepper.jpg" },
                { name: "Brightness", src: "img/brightness.png" },
                { name: "Contrast", src: "img/contrast.png" },
                { name: "Loading", src: "img/loading.gif" }];
var SELECTABLE_IMAGES = new ArrayList(["Lena", "Lena (Small)", "Clown", "Butterfly", "Multicolored", "Vertical Stripes", "Rectangle", "Rectangle (45º)", "Rectangle (45º, off)", "Circle (Small)", "Circle", "Gauss (Small)", "Gauss", "Grid", "Lena (White Noise)", "Lena (Salt 'n Pepper)"]);

// --------------------------------------------------
ImageProcessingApplication = Application.SubClass();

// --------------------------------------------------
ImageProcessingApplication.prototype.__Constructor = function()
{
    Application.prototype.__Constructor.call(this, "outputCanvas");

    this.AddOnResizeCallback(this.ResizePanel.bind(this));

    this.__panel = document.getElementById("panel");

    this.__outputCanvas = this.__canvas;
    this.__outputContext = this.__context;

    this.__inputCanvas = document.getElementById("inputCanvas");
    this.__inputContext = this.__inputCanvas.getContext("2d");

    this.LoadImages(IMAGES);

    this.__filters = new Map();
    this.__filters.Insert("gaussian", function() { ImageFilter.ApplyLowPassFilter(ImageFilter.GAUSSIAN_MASK, this.CloneOutputImageData(), this.__outputImageData, true); });
    this.__filters.Insert("median", function() { ImageFilter.ApplyLowPassFilter(ImageFilter.MEDIAN_MASK, this.CloneOutputImageData(), this.__outputImageData, true); });
    this.__filters.Insert("laplacian", function() { ImageFilter.ApplyHighPassFilter(ImageFilter.LAPLACIAN_MASK, this.CloneOutputImageData(), this.__outputImageData); });
    this.__filters.Insert("sobel", function() { ImageFilter.ApplyHighPassFilter(ImageFilter.SOBEL_MASK, this.CloneOutputImageData(), this.__outputImageData); });
    this.__filters.Insert("prewitt", function() { ImageFilter.ApplyHighPassFilter(ImageFilter.PREWITT_MASK, this.CloneOutputImageData(), this.__outputImageData); });

    this.__transformations = new Map();
    this.__transformations.Insert("grayscale", function() { ImageTransform.GrayScale(this.CloneOutputImageData(), this.__outputImageData); });
    this.__transformations.Insert("mirror", function() { ImageTransform.Mirror(this.CloneOutputImageData(), this.__outputImageData); });
    this.__transformations.Insert("invert", function() { ImageTransform.InvertColors(this.CloneOutputImageData(), this.__outputImageData); });

    this.__layout = null;
    this.__menu = null;
    this.__toolbar = null;
    this.__statusBar = null;
    this.__canvasDialog = null;
    this.__openDialog = null;
    this.__openFromUrlDialog = null;
    this.__histogramDialog = null;
    this.__adjustmentsWindow = null;
    this.__thresholdWindow = null;
    this.__loadingDialog = null;
    this.__fourierFilterControlDialog = null;

    this.__openSelect = null;
    this.__openFromUrlText = null;
    this.__thresholdLabel = null;
    this.__fourierFilterRadiusLabel = null;

    this.__openedImage = null;
    this.__asyncOpenedImage = null;
    this.__outputImageData = null;

    this.__zoomLevel = 1;
    this.__fourierFilterRadius = 0;

    this.__worker = null;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnStart = function()
{
    if (!dhtmlXLayoutObject)
    {
        throw("Missing dhtmlx layout scripts");
    }

    if (!dhtmlXWindows)
    {
        throw("Missing dhtmlx window scripts");
    }

    if (!dhtmlXChart)
    {
        throw("Missing dhtmlx chart scripts");
    }

    this.__layout = new dhtmlXLayoutObject("panel", "1c");

    var mainCell = this.__layout.cells("a");
    mainCell.hideHeader();
    this.__layout.setAutoSize("a", "a");

    this.ResizePanel();

    this.__windowsManager = new dhtmlXWindows();
    this.__windowsManager.setSkin("dhx_skyblue");
    this.__windowsManager.enableAutoViewport(false);
    this.__windowsManager.attachViewportTo("panel");
    this.__windowsManager.setImagePath("img/dhtmlx/");

    this.__menu = this.__layout.attachMenu();

    this.__menu.addNewSibling(null, "filters", "Filters", false);
    this.__menu.addNewChild("filters", 0, "gaussian", "Gaussian", false);
    this.__menu.addNewChild("filters", 1, "median", "Median", false);
    this.__menu.addNewChild("filters", 2, "laplacian", "Laplacian", false);
    this.__menu.addNewChild("filters", 3, "sobel", "Sobel", false);
    this.__menu.addNewChild("filters", 4, "prewitt", "Prewitt", false);
    this.__menu.addNewSibling("filters", "binarization", "Binarization Methods", false);
    this.__menu.addNewChild("binarization", 1, "threshold", "Threshold", false);
    this.__menu.addNewChild("binarization", 2, "otsu", "Otsu", false);
    this.__menu.addNewSibling("binarization", "transformations", "Transformations", false);
    this.__menu.addNewChild("transformations", 1, "grayscale", "Grayscale", false);
    this.__menu.addNewChild("transformations", 2, "mirror", "Mirror", false);
    this.__menu.addNewChild("transformations", 3, "invert", "Invert Colors", false);
    this.__menu.addNewSibling("transformations", "adjustments", "Adjustments", false);
    this.__menu.addNewSibling("adjustments", "fourier", "Fourier Transform", false);
    this.__menu.addNewChild("fourier", 1, "fourierTransformModule", "Show Module", false);
    this.__menu.addNewChild("fourier", 2, "fourierTransformPhase", "Show Phase", false);
    this.__menu.addNewChild("fourier", 3, "applyFourierLowPassFilter", "Low Pass Filter", false);
    this.__menu.addNewChild("fourier", 4, "applyFourierHighPassFilter", "High Pass Filter", false);

    this.__menu.attachEvent("onClick", this.OnClick_Menu.bind(this));

    this.__toolbar = this.__layout.attachToolbar();
    this.__toolbar.addButton("open", 1, null, "img/open.png", null);
    this.__toolbar.setItemToolTip("open", "Open");
    this.__toolbar.addButton("openFromUrl", 2, null, "img/open-url.png", null);
    this.__toolbar.setItemToolTip("openFromUrl", "Open From Url");
    this.__toolbar.addButton("histogram", 3, null, "img/histogram.png", null);
    this.__toolbar.setItemToolTip("histogram", "Show Histogram");
    this.__toolbar.addButton("reset", 4, null, "img/reset.png", null);
    this.__toolbar.setItemToolTip("reset", "Reset All Changes");
    this.__toolbar.addSlider("zoom", 5, 100, 10, 50, 10, "x1", "x5", null);
    this.__toolbar.setItemToolTip("zoom", "Zoom");

    this.__toolbar.attachEvent("onClick", this.OnClick_Toolbar.bind(this));
    this.__toolbar.attachEvent("onValueChange", this.OnValueChange_Toolbar.bind(this));

    this.__statusBar = this.__layout.attachStatusBar();
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ResizePanel = function(e)
{
    var width = (window.innerWidth - 4);
    var height = (window.innerHeight - 4);
    this.__panel.style.width = width + "px";
    this.__panel.style.height = height + "px";
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnValueChange_Toolbar = function(id, value)
{
    if (id === "zoom")
    {
        this.__zoomLevel = value / 10;
        if (this.__openedImage)
        {
            var width = Math.floor(this.__openedImage.width * this.__zoomLevel);
            var height = Math.floor(this.__openedImage.height * this.__zoomLevel);
            this.__outputImageData = this.__context.createImageData(width, height);
            this.ResetAllChanges();

            Assert.NotNull(this.__canvasDialog);
            this.__canvasDialog.setDimension(width, height);
        }
    }
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClose_OpenWindow = function()
{
    this.__openDialog = null;
    return true;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClose_OpenFromUrlWindow = function()
{
    this.__openFromUrlDialog = null;
    return true;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClose_HistogramWindow = function()
{
    this.__histogramDialog = null;
    return true;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClose_AdjustmentsWindow = function()
{
    this.__adjustmentsWindow = null;
    return true;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClose_CanvasWindow = function()
{
    this.__canvasDialog.detachObject(this.__outputCanvas);
    this.__canvasDialog = null;
    this.__openedImage = null;
    return true;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnResizeFinish_CanvasWindow = function()
{
    /*var dimension = this.__canvasDialog.getDimension();
    var top = (dimension[1] - this.__outputCanvas.height) * 0.5,
        left = (dimension[0] - this.__outputCanvas.width) * 0.5;
    this.__outputCanvas.style.margin = top + "px 0px 0px " + left + "px";*/
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClose_ThresholdWindow = function()
{
    this.__thresholdLabel = null;
    this.__thresholdWindow = null;
    return true;
};


// --------------------------------------------------
ImageProcessingApplication.prototype.OnClose_FourierFilterControlDialog = function()
{
    this.__fourierFilterRadiusLabel = null;
    this.__fourierFilterControlDialog = null;
    return true;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClick_Menu = function(id, zoneId, casState)
{
    if (this.__openedImage == null)
    {
        return;
    }

    if (id == "gaussian" || id == "median" || id == "laplacian" || id == "sobel" || id == "prewitt")
    {
        this.ApplyFilter(id);
    }
    else if (id == "grayscale" || id == "mirror" || id == "invert")
    {
        this.ApplyTransformation(id);
    }
    else if (id == "threshold")
    {
        this.OpenThresholdWindow();
    }
    else if (id == "otsu")
    {
        this.ApplyOtsu();
    }
    else if (id == "adjustments")
    {
        this.OpenAdjustmentsWindow();
    }
    else if (id == "fourierTransformModule")
    {
        this.ShowFourierTransformModule();
    }
    else if (id == "fourierTransformPhase")
    {
        this.ShowFourierTransformPhase();
    }
    else if (id == "applyFourierLowPassFilter")
    {
        this.ShowFourierFilterControlDialog("low-pass");
    }
    else if (id == "applyFourierHighPassFilter")
    {
        this.ShowFourierFilterControlDialog("high-pass");
    }
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClick_Toolbar = function(id)
{
    if (id == "open")
    {
        this.ShowOpenDialog();
    }
    else if (id == "openFromUrl")
    {
        this.ShowOpenFromURLDialog();
    }
    else if (id == "histogram")
    {
        this.ShowHistogramDialog();
    }
    else if (id == "reset")
    {
        this.ResetAllChanges();
    }
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ShowOpenDialog = function()
{
    if (this.__openDialog != null)
    {
        return;
    }

    this.__openDialog = this.__windowsManager.createWindow("openWindow", 230, 150, 176, 130);
    this.__openDialog.setText("Open...");
    this.__openDialog.keepInViewport(true);
    this.__openDialog.denyResize();
    this.__windowsManager.window("openWindow").attachEvent("onClose", this.OnClose_OpenWindow.bind(this));

    var openWindowContent = document.createElement("div");
    this.__openDialog.attachObject(openWindowContent);

    var openSelectDiv = document.createElement("div");
    openWindowContent.appendChild(openSelectDiv);
    openSelectDiv.appendChild((this.__openSelect = Select.Create("openSelect", "select", SELECTABLE_IMAGES)));

    var openButtonDiv = document.createElement("div");
    openWindowContent.appendChild(openButtonDiv);
    openButtonDiv.appendChild(Button.Create("openButton", "Open", "button", this.OnClick_OpenButton.bind(this)));
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ShowOpenFromURLDialog = function()
{
    if (this.__openFromUrlDialog != null)
    {
        return;
    }

    this.__openFromUrlDialog = this.__windowsManager.createWindow("openFromUrlWindow", 230, 150, 332, 130);
    this.__openFromUrlDialog.setText("Open from URL...");
    this.__openFromUrlDialog.keepInViewport(true);
    this.__openFromUrlDialog.denyResize();
    this.__windowsManager.window("openFromUrlWindow").attachEvent("onClose", this.OnClose_OpenFromUrlWindow.bind(this));

    var openFromUrlWindowContent = document.createElement("div");
    this.__openFromUrlDialog.attachObject(openFromUrlWindowContent);

    var openFromUrlInputTextDiv = document.createElement("div");
    openFromUrlWindowContent.appendChild(openFromUrlInputTextDiv);
    openFromUrlInputTextDiv.appendChild((this.__openFromUrlText = Text.Create("openFromUrlText", "", "text")));
    this.__openFromUrlText.style.width = "280px";

    var openFromUrlButtonDiv = document.createElement("div");
    openFromUrlWindowContent.appendChild(openFromUrlButtonDiv);
    openFromUrlButtonDiv.appendChild(Button.Create("openFromUrlButton", "Open", "button", this.OnClick_OpenFromUrlButton.bind(this)));
}

// --------------------------------------------------
ImageProcessingApplication.prototype.ShowFourierFilterControlDialog = function(filterType)
{
    if (this.__fourierFilterControlDialog != null)
    {
        return;
    }

    this.__fourierFilterControlDialog = this.__windowsManager.createWindow("fourierFilterControlDialog", 230, 230, 220, 120);
    this.__fourierFilterControlDialog.setText("Fourier Filter Radius");
    this.__fourierFilterControlDialog.keepInViewport(true);
    this.__fourierFilterControlDialog.button("park").hide();
    this.__fourierFilterControlDialog.button("minmax1").hide();
    this.__fourierFilterControlDialog.button("minmax2").hide();
    this.__fourierFilterControlDialog.denyResize();
    this.__windowsManager.window("fourierFilterControlDialog").setModal(true);
    this.__windowsManager.window("fourierFilterControlDialog").attachEvent("onClose", this.OnClose_FourierFilterControlDialog.bind(this));

    var fourierFilterDialogContent = document.createElement("div");
    this.__fourierFilterControlDialog.attachObject(fourierFilterDialogContent);

    var fourierFilterRadiusDiv = document.createElement("div");
    fourierFilterRadiusDiv.id = "fourierFilterRadiusDiv"
    fourierFilterRadiusDiv.style.width = "100%";
    fourierFilterRadiusDiv.style.height = "100%";
    fourierFilterDialogContent.appendChild(fourierFilterRadiusDiv);

    this.__fourierFilterRadius = 64;
    fourierFilterRadiusDiv.appendChild((this.__fourierFilterRadiusLabel = Span.Create("fourierFilterRadiusSpan", "Radius: " + this.__fourierFilterRadius, "text")));

    var fourierFilterRadiusSlider = new dhtmlxSlider("fourierFilterRadiusDiv", 150, "default", false, 1, 128, this.__fourierFilterRadius, 1);
    fourierFilterRadiusSlider.setImagePath("img/dhtmlx/");
    fourierFilterRadiusSlider.attachEvent("onchange", this.OnChange_FourierFilterRadiusSlider.bind(this));
    fourierFilterRadiusSlider.init();

    var applyFourierFilterButtonDiv = document.createElement("div");
    fourierFilterDialogContent.appendChild(applyFourierFilterButtonDiv);
    applyFourierFilterButtonDiv.appendChild(Button.Create("applyFourierFilterButton", "Apply", "button", (filterType == "low-pass") ? this.ApplyFourierLowPassFilter.bind(this) : this.ApplyFourierHighPassFilter.bind(this)));
}

// --------------------------------------------------
ImageProcessingApplication.prototype.ShowLoadingDialog = function()
{
    if (this.__loadingDialog != null)
    {
        return;
    }

    this.__loadingDialog = this.__windowsManager.createWindow("loadingDialog", 376, 276, 56, 56);
    this.__loadingDialog.keepInViewport(true);
    this.__loadingDialog.button("park").hide();
    this.__loadingDialog.button("minmax1").hide();
    this.__loadingDialog.button("minmax2").hide();
    this.__loadingDialog.button("close").hide();
    this.__loadingDialog.denyResize();
    this.__loadingDialog.hideHeader();
    this.__windowsManager.window("loadingDialog").setModal(true);

    var loadingDiv = document.createElement("div");
    loadingDiv.id = "loadingDiv";
    loadingDiv.appendChild(this.__images.Find("Loading"));
    this.__loadingDialog.appendObject(loadingDiv);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.HideLoadingDialog = function()
{
    if (this.__loadingDialog == null)
    {
        return;
    }

    this.__loadingDialog.close();
    this.__loadingDialog = null;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ShowHistogramDialog = function()
{
    if (this.__openedImage == null)
    {
        return;
    }

    if (this.__histogramDialog != null)
    {
        return;
    }

    this.__histogramDialog = this.__windowsManager.createWindow("histogramWindow", 230, 150, 320, 240);
    this.__histogramDialog.setText("Histogram");
    this.__histogramDialog.keepInViewport(true);
    this.__histogramDialog.denyResize();
    this.__windowsManager.window("histogramWindow").attachEvent("onClose", this.OnClose_HistogramWindow.bind(this));

    var histogramChartDiv = document.createElement("div");
    histogramChartDiv.id = "histogramChartDiv"
    histogramChartDiv.style.width = "100%";
    histogramChartDiv.style.height = "100%";
    this.__histogramDialog.appendObject(histogramChartDiv);

    var chart = new dhtmlXChart({
        view: "area",
        container: "histogramChartDiv",
        value:"#frequency#",
        xAxis:{
            title: "Luminance",
            template: function(e)
            {
                return "";
            }
        },
        yAxis:{
            title: "Frequency",
            template: function(e)
            {
                return "";
            }
        }
    });

    var histogram = ImageDataUtils.GetLuminanceHistogram(this.__outputImageData, 64);

    var size = this.__outputImageData.width * this.__outputImageData.height;
    for (var i = 0; i < 64; i++)
    {
        var data = histogram[i];
        data.frequency /= size;
    }

    chart.parse(histogram, "json");
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OpenThresholdWindow = function()
{
    if (this.__thresholdWindow != null)
    {
        return;
    }

    this.__thresholdWindow = this.__windowsManager.createWindow("thresholdWindow", 230, 230, 220, 120);
    this.__thresholdWindow.setText("Threshold Binarization");
    this.__thresholdWindow.keepInViewport(true);
    this.__thresholdWindow.denyResize();
    this.__windowsManager.window("thresholdWindow").attachEvent("onClose", this.OnClose_ThresholdWindow.bind(this));

    var thresholdDiv = document.createElement("div");
    thresholdDiv.id = "thresholdDiv"
    thresholdDiv.style.width = "100%";
    thresholdDiv.style.height = "100%";
    this.__thresholdWindow.appendObject(thresholdDiv);

    thresholdDiv.appendChild((this.__thresholdLabel = Span.Create("thresholdSpan", "Threshold: 0", "text")));

    var thresholdSlider = new dhtmlxSlider("thresholdDiv", 150, "default", false, 0, 255, 0, 1);
    thresholdSlider.setImagePath("img/dhtmlx/");
    thresholdSlider.attachEvent("onchange", this.OnChange_ThresholdSlider.bind(this));
    thresholdSlider.init();
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ShowFourierTransformModule = function()
{
    if (Type.IsUndefined(Worker))
    {
        var fourierTransform = new FourierTransform();
        fourierTransform.Compute(this.__outputImageData);
        fourierTransform.DrawPhase(this.__outputImageData);
    }
    else
    {
        this.RunAsyncOperation("showFourierTransformModule", "Fourier Transform");
    }
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ShowFourierTransformPhase = function()
{
    if (Type.IsUndefined(Worker))
    {
        var fourierTransform = new FourierTransform();
        fourierTransform.Compute(this.__outputImageData);
        fourierTransform.DrawPhase(this.__outputImageData);
    }
    else
    {
        this.RunAsyncOperation("showFourierTransformPhase", "Fourier Transform");
    }
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ApplyFourierLowPassFilter = function()
{
    if (this.__fourierFilterControlDialog == null)
    {
        return;
    }
    this.__fourierFilterControlDialog.close();

    if (Type.IsUndefined(Worker))
    {
        var fourierTransform = new FourierTransform();
        fourierTransform.Compute(this.__outputImageData);
        fourierTransform.ApplyLowPassFilter(this.__fourierFilterRadius);
        fourierTransform.Invert();
        fourierTransform.DrawModule(this.__outputImageData);
    }
    else
    {
        this.RunAsyncOperation("applyFourierLowPassFilter", "Fourier Transform", [this.__fourierFilterRadius]);
    }
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ApplyFourierHighPassFilter = function()
{
    if (this.__fourierFilterControlDialog == null)
    {
        return;
    }
    this.__fourierFilterControlDialog.close();

    if (Type.IsUndefined(Worker))
    {
        var fourierTransform = new FourierTransform();
        fourierTransform.Compute(this.__outputImageData);
        fourierTransform.ApplyHighPassFilter(this.__fourierFilterRadius);
        fourierTransform.Invert();
        fourierTransform.DrawModule(this.__outputImageData);
    }
    else
    {
        this.RunAsyncOperation("applyFourierHighPassFilter", "Fourier Transform", [this.__fourierFilterRadius]);
    }
};

// --------------------------------------------------
ImageProcessingApplication.prototype.RunAsyncOperation = function(operation, description, extraArgs)
{
    if (Type.IsUndefined(extraArgs))
    {
        extraArgs = [];
    }

    this.ShowLoadingDialog();

    this.__statusBar.setText("Running " + description + "...");

    if (this.__worker == null)
    {
        this.__worker = new Worker("ImageProcessingApplicationWorker.js");
        this.__worker.addEventListener("message", this.OnWorkerMessage.bind(this), false);
        this.__worker.addEventListener("error", this.OnWorkerError.bind(this), false);
    }

    this.__worker.postMessage({ operation: operation, extraArgs: extraArgs, inputImageData: this.CloneOutputImageData(), outputImageData: this.__outputImageData });
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnWorkerMessage = function(e)
{
    var arg0 = e.data;
    var operation = arg0.operation;
    var outputImageData = arg0.outputImageData;
    var elapsedTime = arg0.elapsedTime;

    if (operation == "applyFourierLowPassFilter" || operation == "applyFourierHighPassFilter")
    {
        var halfWidth = Math.floor(outputImageData.width / 2);
        var halfHeight = Math.floor(outputImageData.height / 2);
        var tmpOutputImageData = this.__outputContext.createImageData(outputImageData.width + halfWidth, outputImageData.height + halfHeight);
        ImageDataUtils.Shift(outputImageData, tmpOutputImageData);
    }

    ImageDataUtils.Copy(outputImageData, this.__outputImageData);
    this.__statusBar.setText("Elapsed Time: " + elapsedTime + " sec(s)");
    this.HideLoadingDialog();
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnWorkerError = function(e)
{
    System.Print(e.message);
    this.__statusBar.setText("");
    this.HideLoadingDialog();
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ApplyOtsu = function()
{
    this.ShowLoadingDialog();

    this.RunAsyncOperation("runOtsusMethod", "Otsu's Method", null);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ApplyFilter = function(filterName)
{
    var filter = this.__filters.Find(filterName);

    if (filter == null)
    {
        return;
    }

    filter.call(this);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ApplyTransformation = function(transformationName)
{
    var transformation = this.__transformations.Find(transformationName);

    if (transformation == null)
    {
        return;
    }

    transformation.call(this);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ShowOpenedImageDialog = function(title)
{
    if (this.__openedImage == null)
    {
        return;
    }

    var width = Math.floor(this.__openedImage.width * this.__zoomLevel);
    var height = Math.floor(this.__openedImage.height * this.__zoomLevel);
    this.__outputImageData = this.__context.createImageData(width, height);
    this.ResetAllChanges();

    width = Math.max(width + 16, 128);
    height = Math.max(height + 16, 128);

    if (this.__canvasDialog != null)
    {
        this.__canvasDialog.close();
        this.__canvasDialog = null;
    }

    this.__canvasDialog = this.__windowsManager.createWindow("canvasWindow", 10, 80, width, height);
    this.__canvasDialog.setText(title);
    this.__canvasDialog.keepInViewport(true);
    this.__canvasDialog.attachEvent("onClose", this.OnClose_CanvasWindow.bind(this));
    this.__canvasDialog.attachEvent("onResizeFinish", this.OnResizeFinish_CanvasWindow.bind(this));

    this.__outputCanvas.style.display = "visible";
    this.__canvasDialog.attachObject(this.__outputCanvas);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClick_OpenButton = function()
{
    this.__openDialog.close();
    var imageName = this.__openSelect.options[this.__openSelect.selectedIndex].text;
    this.__openedImage = this.__images.Find(imageName);
    this.ShowOpenedImageDialog(imageName);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnLoad_OpenFromUrlImage = function()
{
    this.__openFromUrlDialog.close();
    this.__openedImage = this.__asyncOpenedImage;
    this.__asyncOpenedImage = null;
    this.ShowOpenedImageDialog(this.__openFromUrlText.value);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnClick_OpenFromUrlButton = function()
{
    Assert.NotNull(this.__openFromUrlDialog);
    Assert.NotNull(this.__openFromUrlText);

    this.ShowLoadingDialog();

    if (this.__canvasDialog != null)
    {
        this.__canvasDialog.close();
    }
    this.__asyncOpenedImage = new Image();
    this.__asyncOpenedImage.onload = this.OnLoad_OpenFromUrlImage.bind(this);
    this.__asyncOpenedImage.src = "/openFromUrl.php?url=" + this.__openFromUrlText.value;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnChange_BrightnessSlider = function(newValue, sliderObj)
{
    if (this.__adjustmentsWindow == null)
    {
        return;
    }

    ImageTransform.SetBrightness(this.GetInputImageData(), this.__outputImageData, newValue / 100.0);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnChange_ContrastSlider = function(newValue, sliderObj)
{
    if (this.__adjustmentsWindow == null)
    {
        return;
    }

    ImageTransform.SetContrast(this.GetInputImageData(), this.__outputImageData, newValue / 100.0);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnChange_ThresholdSlider = function(newValue, sliderObj)
{
    if (this.__thresholdWindow == null)
    {
        return;
    }

    if (this.__thresholdLabel == null)
    {
        return;
    }

    this.__thresholdLabel.innerHTML = "Threshold: " + newValue;

    ImageBinarization.Threshold(this.GetInputImageData(), this.__outputImageData, newValue);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnChange_FourierFilterRadiusSlider = function(newValue, sliderObj)
{
    if (this.__fourierFilterControlDialog == null)
    {
        return;
    }

    if (this.__fourierFilterRadiusLabel == null)
    {
        return;
    }

    this.__fourierFilterRadius = newValue;
    this.__fourierFilterRadiusLabel.innerHTML = "Radius: " + this.__fourierFilterRadius;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OpenAdjustmentsWindow = function()
{
    if (this.__adjustmentsWindow != null)
    {
        return;
    }

    this.__adjustmentsWindow = this.__windowsManager.createWindow("adjustmentsWindow", 430, 25, 210, 135);
    this.__adjustmentsWindow.setText("Adjustments");
    this.__adjustmentsWindow.keepInViewport(true);
    this.__adjustmentsWindow.denyResize();
    this.__windowsManager.window("adjustmentsWindow").attachEvent("onClose", this.OnClose_AdjustmentsWindow.bind(this));

    var brightnessDiv = document.createElement("div");
    brightnessDiv.id = "brightnessDiv";
    brightnessDiv.appendChild(this.__images.Find("Brightness"));
    brightnessDiv.appendChild(Span.Create("brightnessSpan", "Brightness", "text"));
    this.__adjustmentsWindow.appendObject(brightnessDiv);

    this.__thresholdSlider = new dhtmlxSlider("brightnessDiv", 150, "default", false, 1, 200, 100, 1);
    this.__thresholdSlider.setImagePath("img/dhtmlx/");
    this.__thresholdSlider.attachEvent("onchange", this.OnChange_BrightnessSlider.bind(this));
    this.__thresholdSlider.init();

    var contrastDiv = document.createElement("div");
    contrastDiv.id = "contrastDiv";
    contrastDiv.appendChild(this.__images.Find("Contrast"));
    contrastDiv.appendChild(Span.Create("contrastSpan", "Contrast", "text"));
    this.__adjustmentsWindow.appendObject(contrastDiv);

    this.__contrastSlider = new dhtmlxSlider("contrastDiv", 150, "default", false, 0, 200, 100, 1);
    this.__contrastSlider.setImagePath("img/dhtmlx/");
    this.__contrastSlider.attachEvent("onchange", this.OnChange_ContrastSlider.bind(this));
    this.__contrastSlider .init();
};

// --------------------------------------------------
ImageProcessingApplication.prototype.ResetAllChanges = function()
{
    if (this.__openedImage == null)
    {
        return;
    }

    ImageDataUtils.Copy(this.GetInputImageData(), this.__outputImageData);
}

// --------------------------------------------------
ImageProcessingApplication.prototype.GetInputImageData = function()
{
    this.DrawInputCanvas();
    return this.__inputContext.getImageData(0, 0, this.__inputCanvas.width, this.__inputCanvas.height);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.CloneOutputImageData = function()
{
    var outputImageDataClone = this.__outputContext.createImageData(this.__outputImageData.width, this.__outputImageData.height);
    ImageDataUtils.Copy(this.__outputImageData, outputImageDataClone);
    return outputImageDataClone;
};

// --------------------------------------------------
ImageProcessingApplication.prototype.OnUpdate = function(deltaTime)
{
    this.ClearCanvas();
    this.ClearCanvas(this.__inputCanvas);

    if (this.__openedImage == null)
    {
        this.__inputCanvas.width = DEFAULT_CANVAS_WIDTH;
        this.__inputCanvas.height = DEFAULT_CANVAS_HEIGHT;
        this.__outputCanvas.width = DEFAULT_CANVAS_WIDTH;
        this.__outputCanvas.height = DEFAULT_CANVAS_HEIGHT;

        this.__inputContext.fillStyle = "white";
        this.__inputContext.fillRect(0, 0, this.__inputCanvas.width, this.__inputCanvas.height);

        this.__outputContext.fillStyle = "white";
        this.__outputContext.fillRect(0, 0, this.__outputCanvas.width, this.__outputCanvas.height);

        return;
    }

    this.DrawInputCanvas();
    this.DrawOutputCanvas();
};

// --------------------------------------------------
ImageProcessingApplication.prototype.DrawInputCanvas = function()
{
    this.__inputCanvas.width = Math.floor(this.__openedImage.width * this.__zoomLevel);
    this.__inputCanvas.height = Math.floor(this.__openedImage.height * this.__zoomLevel);
    this.__inputContext.scale(this.__zoomLevel, this.__zoomLevel);
    this.__inputContext.drawImage(this.__openedImage, 0, 0);
};

// --------------------------------------------------
ImageProcessingApplication.prototype.DrawOutputCanvas = function()
{
    this.__outputCanvas.width = this.__outputImageData.width;
    this.__outputCanvas.height = this.__outputImageData.height;
    this.__outputContext.putImageData(this.__outputImageData, 0, 0);
};

// --------------------------------------------------
System.RegisterEventListener("load", function(event)
{
    var application = new ImageProcessingApplication();
    application.Run();
});