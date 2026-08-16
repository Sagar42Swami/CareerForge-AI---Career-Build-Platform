import streamlit as st


def apply_dark_theme() -> None:
    st.markdown(
        """
        <style>
        .stApp {
            background: #0d1117;
            color: #f0f6fc;
        }

        [data-testid="stSidebar"] {
            background: #111827;
            border-right: 1px solid #263244;
        }

        .stButton > button,
        .stDownloadButton > button {
            border-radius: 8px;
            font-weight: 700;
        }

        textarea {
            border-radius: 8px !important;
        }

        [data-testid="stMetric"] {
            background: #151b23;
            border: 1px solid #263244;
            border-radius: 8px;
            padding: 14px;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )
