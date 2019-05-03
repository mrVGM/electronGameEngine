var state = {
    create: function() {
        var st = {
            current: undefined,
            setState(s) {
                if (st.current) {
                    st.current.exitState();
                }
                st.current = s;
                st.current.enterState();
            }
        };
        return st;
    }
};

module.exports = state;