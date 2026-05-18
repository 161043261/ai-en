import requests
from typing import Any, BinaryIO


class ServerAPI:
    ENDPOINTS: dict[str, str] = {
        "health_check": "/api/v1/health",
        "readiness_check": "/api/v1/ready",
        "user_login": "/api/v1/user/login",
        "user_register": "/api/v1/user/register",
        "user_refresh_token": "/api/v1/user/refresh-token",
        "user_upload_avatar": "/api/v1/user/upload-avatar",
        "user_update_profile": "/api/v1/user/update-user",
        "word_book_list": "/api/v1/word-book",
        "ai_prompt_list": "/api/v1/ai/prompt/list",
        "ai_chat_stream": "/api/v1/ai/chat",
        "ai_chat_history": "/api/v1/ai/chat/history",
        "legacy_ai_prompt_list_alias": "/ai/v1/prompt/list",
        "legacy_ai_chat_stream_alias": "/ai/v1/chat",
        "legacy_ai_chat_history_alias": "/ai/v1/chat/history",
        "course_list": "/api/v1/course/list",
        "my_courses": "/api/v1/course/my",
        "learning_words_by_course": "/api/v1/learn/word/{course_id}",
        "save_mastered_words": "/api/v1/learn/word/master",
        "create_payment_order": "/api/v1/pay/create",
        "payment_status": "/api/v1/pay/status/{out_trade_no}",
        "payment_notify_callback": "/api/v1/pay/notify",
        "track_uv": "/api/v1/tracker/uv",
        "update_uv": "/api/v1/tracker/update-uv",
        "track_page_view": "/api/v1/tracker/pv",
        "track_performance": "/api/v1/tracker/performance",
        "track_custom_event": "/api/v1/tracker/event",
        "track_error": "/api/v1/tracker/error",
    }

    def __init__(self, base_url: str = "http://localhost:3000") -> None:
        self.base_url: str = base_url
        self.access_token: str = "replace-with-access-token"
        self.refresh_token: str = "replace-with-refresh-token"
        self.visitor_id: str = "replace-with-visitor-id"
        self.course_id: str = "replace-with-course-id"
        self.out_trade_no: str = "replace-with-out-trade-no"
        self.payment_notify_secret: str = "replace-with-payment-notify-secret"

    def _get_headers(
        self, with_auth: bool = False, extra_headers: dict[str, str] | None = None
    ) -> dict[str, str]:
        headers: dict[str, str] = {}
        if with_auth:
            headers["Authorization"] = f"Bearer {self.access_token}"
        if extra_headers:
            headers.update(extra_headers)
        return headers

    def health_check(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['health_check']}"
        return requests.get(url)

    def readiness_check(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['readiness_check']}"
        return requests.get(url)

    def user_login(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['user_login']}"
        payload: dict[str, str] = {"phone": "13800000000", "password": "password123"}
        return requests.post(url, json=payload)

    def user_register(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['user_register']}"
        payload: dict[str, str] = {
            "name": "Test User",
            "phone": "13800000001",
            "password": "password123",
            "email": "test@example.com",
        }
        return requests.post(url, json=payload)

    def user_refresh_token(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['user_refresh_token']}"
        payload: dict[str, str] = {"refreshToken": self.refresh_token}
        return requests.post(url, json=payload)

    def user_upload_avatar(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['user_upload_avatar']}"
        headers: dict[str, str] = self._get_headers(with_auth=True)
        files: dict[str, tuple[str, BinaryIO, str]] = {
            "file": ("avatar.png", open("./avatar.png", "rb"), "image/png")
        }
        return requests.post(url, headers=headers, files=files)

    def user_update_profile(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['user_update_profile']}"
        headers: dict[str, str] = self._get_headers(with_auth=True)
        payload: dict[str, Any] = {
            "name": "Updated User",
            "email": "updated@example.com",
            "address": "Example Address",
            "avatar": "/bucket/avatar.png",
            "bio": "English learner.",
            "isTimingTask": True,
            "timingTaskTime": "08:30",
        }
        return requests.post(url, headers=headers, json=payload)

    def word_book_list(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['word_book_list']}"
        params: dict[str, Any] = {
            "page": 1,
            "pageSize": 12,
            "word": "acquit",
            "gre": "true",
            "toefl": "true",
        }
        return requests.get(url, params=params)

    def ai_prompt_list(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['ai_prompt_list']}"
        return requests.get(url)

    def ai_chat_stream(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['ai_chat_stream']}"
        headers: dict[str, str] = self._get_headers(
            extra_headers={"Accept": "text/event-stream"}
        )
        payload: dict[str, Any] = {
            "role": "normal",
            "content": "Give me one sentence with the word acquit.",
            "userId": "demo-user",
            "webSearch": False,
            "deepThink": False,
        }
        return requests.post(url, headers=headers, json=payload, stream=True)

    def ai_chat_history(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['ai_chat_history']}"
        params: dict[str, str] = {"userId": "demo-user", "role": "normal"}
        return requests.get(url, params=params)

    def legacy_ai_prompt_list_alias(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['legacy_ai_prompt_list_alias']}"
        return requests.get(url)

    def legacy_ai_chat_stream_alias(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['legacy_ai_chat_stream_alias']}"
        headers: dict[str, str] = self._get_headers(
            extra_headers={"Accept": "text/event-stream"}
        )
        payload: dict[str, Any] = {
            "role": "master",
            "content": "Explain the difference between affect and effect.",
            "userId": "demo-user",
            "webSearch": False,
            "deepThink": False,
        }
        return requests.post(url, headers=headers, json=payload, stream=True)

    def legacy_ai_chat_history_alias(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['legacy_ai_chat_history_alias']}"
        params: dict[str, str] = {"userId": "demo-user", "role": "master"}
        return requests.get(url, params=params)

    def course_list(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['course_list']}"
        return requests.get(url)

    def my_courses(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['my_courses']}"
        headers: dict[str, str] = self._get_headers(with_auth=True)
        return requests.get(url, headers=headers)

    def learning_words_by_course(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['learning_words_by_course'].format(course_id=self.course_id)}"
        headers: dict[str, str] = self._get_headers(with_auth=True)
        return requests.get(url, headers=headers)

    def save_mastered_words(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['save_mastered_words']}"
        headers: dict[str, str] = self._get_headers(with_auth=True)
        payload: dict[str, list[str]] = {"wordIds": ["word-id-1", "word-id-2"]}
        return requests.post(url, headers=headers, json=payload)

    def create_payment_order(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['create_payment_order']}"
        headers: dict[str, str] = self._get_headers(with_auth=True)
        payload: dict[str, Any] = {
            "courseId": self.course_id,
            "totalAmount": 9.9,
            "subject": "English Course",
            "body": "Course purchase",
        }
        return requests.post(url, headers=headers, json=payload)

    def payment_status(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['payment_status'].format(out_trade_no=self.out_trade_no)}"
        headers: dict[str, str] = self._get_headers(with_auth=True)
        return requests.get(url, headers=headers)

    def payment_notify_callback(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['payment_notify_callback']}"
        headers: dict[str, str] = self._get_headers(
            extra_headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "x-payment-notify-secret": self.payment_notify_secret,
            }
        )
        payload: dict[str, str] = {
            "out_trade_no": self.out_trade_no,
            "trade_no": "trade-no-1",
            "gmt_payment": "2026-05-18 10:00:00",
            "trade_status": "TRADE_SUCCESS",
            "body": '{"userId":"user-id-1","courseId":"course-id-1"}',
        }
        return requests.post(url, headers=headers, data=payload)

    def track_uv(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['track_uv']}"
        payload: dict[str, str] = {
            "anonymousId": "anonymous-id-1",
            "userId": "user-id-1",
            "browser": "Chrome",
            "os": "macOS",
            "device": "Desktop",
        }
        return requests.post(url, json=payload)

    def update_uv(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['update_uv']}"
        payload: dict[str, str] = {"visitorId": self.visitor_id, "userId": "user-id-1"}
        return requests.post(url, json=payload)

    def track_page_view(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['track_page_view']}"
        payload: dict[str, str] = {
            "visitorId": self.visitor_id,
            "url": "http://localhost:5173/word-book",
            "referrer": "http://localhost:5173/",
            "path": "/word-book",
        }
        return requests.post(url, json=payload)

    def track_performance(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['track_performance']}"
        payload: dict[str, Any] = {
            "visitorId": self.visitor_id,
            "fp": 120,
            "fcp": 240,
            "lcp": 900,
            "inp": 80,
            "cls": 0.02,
        }
        return requests.post(url, json=payload)

    def track_custom_event(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['track_custom_event']}"
        payload: dict[str, Any] = {
            "visitorId": self.visitor_id,
            "event": "word_card_click",
            "payload": {"word": "acquit"},
            "url": "http://localhost:5173/word-book",
        }
        return requests.post(url, json=payload)

    def track_error(self) -> requests.Response:
        url: str = f"{self.base_url}{self.ENDPOINTS['track_error']}"
        payload: dict[str, str] = {
            "visitorId": self.visitor_id,
            "error": "TypeError",
            "message": "Example error message.",
            "stack": "TypeError: Example error message.",
            "url": "http://localhost:5173/word-book",
        }
        return requests.post(url, json=payload)


if __name__ == "__main__":
    api = ServerAPI()

    # Example usage:
    # try:
    #     response = api.health_check()
    #     print("Health Check:", response.status_code, response.text)
    # except Exception as e:
    #     print("Error during health check:", e)
