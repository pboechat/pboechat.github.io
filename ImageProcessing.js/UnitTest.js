// --------------------------------------------------
//                UNIT TEST FRAMEWORK
// --------------------------------------------------
UnitTest = function() {};

UnitTest.__testCaseDescriptions = new ArrayList();

// --------------------------------------------------
UnitTest.AddTestCase = function(fileName, testCaseName, testCaseFunction)
{
    UnitTest.__testCaseDescriptions.Sum({ fileName: fileName, name: testCaseName, function: testCaseFunction});
};

// --------------------------------------------------
UnitTest.Run = function()
{
    UnitTest.__testCaseDescriptions.ForEach(function(testCaseDescription)
    {

        var start = System.Now();
        var result;
        try
        {
            testCaseDescription.function();
            result = "SUCCESS";
        } catch (e)
        {
            result = "FAILURE (" + e.message + ")";
        }
        var end = System.Now();
        var elapsedTime = (end - start) / 1000.0;

        System.Print(testCaseDescription.fileName + " - " +  testCaseDescription.name + " - " + result + " (" + elapsedTime + " sec(s))");
    });
};

// --------------------------------------------------
System.RegisterEventListener("load", UnitTest.Run);
