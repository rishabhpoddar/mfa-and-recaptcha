import axios from "axios";
import { getApiDomain } from "../config";

export default function CallAPIView() {
    async function callAPIClicked() {
        let response = await axios.get(getApiDomain() + "/sessioninfo");
        window.alert("Session Information:\n" + JSON.stringify(response.data, null, 2));
    }

    async function callAPIWithBlacklistingClicked() {
        try {
            let response = await axios.get(getApiDomain() + "/sessioninfo-with-blacklisting");
            window.alert("Session Information:\n" + JSON.stringify(response.data, null, 2));
        } catch (err: any) {
            if (err.response.status === 401) {
                // ignored
            } else {
                throw err;
            }
        }
    }

    return (
        <div>
            <div onClick={callAPIClicked} className="sessionButton">
                Call API
            </div>
            <div
                style={{
                    marginTop: "20px"
                }}
                onClick={callAPIWithBlacklistingClicked} className="sessionButton">
                Call API with blacklisting
            </div>
        </div>

    );
}
