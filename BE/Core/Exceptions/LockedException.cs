﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Exceptions
{
    public class LockedException : Exception
    {
        public LockedException(string message) : base(message) { }
    }
}
