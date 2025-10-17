import {useEffect, useRef} from 'react';
import useScript from '../../hooks/useScript';
import {useApi} from "../../hooks/useApi.js";
import {useToken} from "../../hooks/useToken.js";
import {useNavigate} from "react-router-dom";
import {notification, Spin} from "antd";

export function GoogleLogin() {
    const {post, data, isSuccess, isError, error, isLoading} = useApi();
    const {setToken} = useToken();
    const navigate = useNavigate();

    const onGoogleSignIn = ({ credential }) => {
        post("/google", { credential });
    }

    const [notificationApi, notificationContext] = notification.useNotification();
    
    useEffect(() => {
        if (isSuccess) {
            setToken(data.token);
            navigate('/');
        }
    }, [data, isSuccess, navigate, setToken])

    useEffect(() => {
        if(isError) {
            notificationApi.error({
                message: "Có lỗi xảy ra",
                description: error
            })
        }
    }, [isError, error, notificationApi]);

    const googleSignInButton = useRef(null);

    useScript('https://accounts.google.com/gsi/client', () => {
        // https://developers.google.com/identity/gsi/web/reference/js-reference#google.accounts.id.initialize
        window.google.accounts.id.initialize({
            client_id: "872549883795-52oi2ccseqn4ttpdeg1perc39en0470o.apps.googleusercontent.com",
            callback: onGoogleSignIn,
        });
        // https://developers.google.com/identity/gsi/web/reference/js-reference#google.accounts.id.renderButton
        window.google.accounts.id.renderButton(googleSignInButton.current, {
                type: "standard",
                theme: 'outline',
                size: 'large',
                text: "signin_with",
                width: '250'
            },
        );
    });

    return <>
        {notificationContext}
        <Spin spinning={isLoading}>
            <div ref={googleSignInButton}></div>
        </Spin>
    </>;
}