
import React, { useState } from "react";
import './index.scss'

function getText() {
  return '按钮'
}
export default function Button ({ text }) {
  return <button className='test_button'>{ text || getText()}</button>
}
