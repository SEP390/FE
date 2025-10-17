import {useEffect, useRef} from 'react';
import useScript from '../../hooks/useScript';
import {useApi} from "../../hooks/useApi.js";
import {useToken} from "../../hooks/useToken.js";
import {useNavigate} from "react-router-dom";

export function GoogleLogin() {
    const {post, data, isSuccess} = useApi();
    const {setToken} = useToken();
    const navigate = useNavigate();

    const onGoogleSignIn = ({ credential }) => {
        post("/google", { credential });
    }
    
    useEffect(() => {
        if (isSuccess) {
            setToken(data.token);
            navigate('/');
        }
    }, [data, isSuccess, navigate, setToken])

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

    return <div ref={googleSignInButton}></div>;
}