package cordova-plugin-inappbrowser;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

import java.util.ArrayList;
import java.util.HashMap;

import static junit.framework.Assert.assertEquals;
import static org.junit.Assert.*;

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
 */
@RunWith(RobolectricTestRunner.class)
@Config(manifest=Config.NONE)
public class InAppBrowserUnitTest {

    protected class TestableInAppBrowser extends InAppBrowser {
        public String getPrivateHelloWorldString(JSONObject jsonObject, boolean withCache) {
            return privateHelloWorldString();
        }
    }

    private TestableInAppBrowser templatePlugin;

    @Before
    public void setUp(){ this.templatePlugin = new TestableInAppBrowser(); }

    @Test
    public void getPrivateHelloWorldString_ReturnsCorrectValue() throws Exception {
        String obtainedResult = templatePlugin.privateHelloWorldString();
        String expectedResult = "Hello World";
        assertEquals("A unexpected string was returned.",obtainedResult, expectedResult);
    }


    @Test
    public void getPublicHelloWorldString_ReturnsCorrectValue() throws Exception {
        String obtainedResult = templatePlugin.publicHelloWorld();

        assertNotNull("A null string was returned.",obtainedResult);

        String expectedResult = "Hello World";
        assertEquals("A unexpected string was returned.",obtainedResult, expectedResult);
    }

}